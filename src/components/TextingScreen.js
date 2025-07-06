import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowCircleLeft,
  FaSync,
  FaTimes,
  FaArrowDown,
  FaEdit,
  FaTrash,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import logo from "../assets/op.jpg";
import logo1 from "../assets/original.png";
import { dotWave } from "ldrs";

const formatLastSeen = (lastActivity, status) => {
  if (status === "online") return "Status: Online";
  if (!lastActivity) return "Last seen: Never";

  const now = new Date();
  const lastSeenDate = lastActivity.toDate();
  const diffMs = now - lastSeenDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Last seen: Just now";
  if (diffMins < 60)
    return `Last seen: ${diffMins} minute${
      diffMins === 1 ? "" : "s"
    } ago at ${lastSeenDate.toLocaleTimeString({
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  if (diffHours < 24)
    return `Last seen: ${diffHours} hour${
      diffHours === 1 ? "" : "s"
    } ago at ${lastSeenDate.toLocaleTimeString({
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  if (diffDays < 7)
    return `Last seen: ${diffDays} day${
      diffDays === 1 ? "" : "s"
    } ago at ${lastSeenDate.toLocaleTimeString({
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  return `Last seen: ${lastSeenDate.toLocaleDateString()} at ${lastSeenDate.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;
};

const TextingScreen = () => {
  const [currentUserProgram, setCurrentUserProgram] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [usersInProgram, setUsersInProgram] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    about: "",
    userNumber: "",
    visibility: {
      username: true,
      fullname: true,
      userNumber: true,
      programOfStudy: true,
      levelOfStudy: true,
      about: true,
      lastActivity: true,
    },
  });
  const messageContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const navigate = useNavigate();

  const fetchUnreadCounts = async () => {
    if (!auth.currentUser) return;
    try {
      const textQuery = query(
        collection(db, "text"),
        where("userIds", "array-contains", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(textQuery);
      const counts = {};
      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        const otherUserId = conversation.userIds.find(
          (id) => id !== auth.currentUser.uid
        );
        const messages = conversation.messages || [];
        const unread = messages.filter(
          (msg) => msg.senderId === otherUserId && msg.read === false
        ).length;
        if (unread > 0) {
          counts[otherUserId] = unread;
        }
      });
      setUnreadCounts(counts);
    } catch (err) {
      setError("Failed to fetch unread counts: " + err.message);
    }
  };
  useEffect(() => {
    fetchUnreadCounts();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!selectedUser || !auth.currentUser) return;

    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);

    const handleTyping = async () => {
      try {
        const docSnapshot = await getDoc(conversationRef);
        let typingUsers = docSnapshot.exists()
          ? docSnapshot.data().typingUsers || []
          : [];
        if (newMessage.trim() && !typingUsers.includes(auth.currentUser.uid)) {
          typingUsers = [...typingUsers, auth.currentUser.uid];
        } else if (
          !newMessage.trim() &&
          typingUsers.includes(auth.currentUser.uid)
        ) {
          typingUsers = typingUsers.filter(
            (uid) => uid !== auth.currentUser.uid
          );
        }
        await updateDoc(conversationRef, { typingUsers });
      } catch (err) {
        console.error("Failed to update typing status:", err);
      }
    };

    handleTyping();
  }, [newMessage, selectedUser, auth.currentUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);

    const unsubscribe = onSnapshot(conversationRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const { typingUsers = [] } = docSnapshot.data();
        setIsTyping(typingUsers.includes(selectedUser.id));
      }
    });

    return () => unsubscribe();
  }, [selectedUser, auth.currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const fetchUserData = async () => {
        setLoading(true);
        setError(null);
        try {
          const currentUserDoc = await getDoc(doc(db, "users", user.uid));
          if (!currentUserDoc.exists()) {
            setError("User profile not found.");
            setLoading(false);
            return;
          }
          const userData = currentUserDoc.data();
          setCurrentUserProgram(userData.programOfStudy || "");
          setCurrentUserProfile(userData);

          setFormData({
            fullname: userData.fullname || "",
            about: userData.about || "",
            userNumber: userData.userNumber || "",
            visibility: userData.visibility || {
              username: true,
              fullname: true,
              userNumber: true,
              programOfStudy: true,
              levelOfStudy: true,
              about: true,
              lastActivity: true,
            },
          });

          const usersQuery = query(
            collection(db, "users"),
            where("programOfStudy", "==", userData.programOfStudy),
            where("role", "!=", "admin")
          );
          const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersList = snapshot.docs
              .filter((doc) => doc.id !== user.uid)
              .map((doc) => ({
                id: doc.id,
                username: doc.data().username || "Unknown",
                status: doc.data().status || "Unknown",
              }));
            setUsersInProgram(usersList);
            setLoading(false);
          });
          return () => unsubscribe();
        } catch (err) {
          setError("Failed to load users: " + err.message);
          setLoading(false);
        }
      };

      fetchUserData();
    });
    return () => unsubscribe();
  }, [navigate]);

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (count || 0),
    0
  );

  const filteredUsers = usersInProgram.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!showUnreadOnly || unreadCounts[user.id] > 0)
  );

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserProfile(null);
      setMessages([]);
      return;
    }

    const fetchSelectedUserProfile = () => {
      setLoadingProfile(true);
      const userRef = doc(db, "users", selectedUser.id);
      const unsubscribe = onSnapshot(
        userRef,
        (userDoc) => {
          if (userDoc.exists()) {
            setSelectedUserProfile(userDoc.data());
          } else {
            setError("Selected user's profile not found.");
          }
          setLoadingProfile(false);
        },
        (err) => {
          setError("Failed to load user profile: " + err.message);
          setLoadingProfile(false);
        }
      );
      return () => unsubscribe();
    };

    fetchSelectedUserProfile();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);

    const unsubscribe = onSnapshot(
      conversationRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const conversationData = docSnapshot.data();
          const messages = conversationData.messages || [];
          const updatedMessages = messages.map((msg) => {
            if (msg.senderId !== auth.currentUser.uid && msg.read === false) {
              return { ...msg, read: true };
            }
            return msg;
          });
          if (JSON.stringify(messages) !== JSON.stringify(updatedMessages)) {
            await updateDoc(conversationRef, { messages: updatedMessages });
            fetchUnreadCounts();
          }

          setMessages(updatedMessages);
        } else {
          setMessages([]);
        }
      },
      (err) => {
        setError("Failed to load messages: " + err.message);
      }
    );

    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!container) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      setIsAtBottom(scrollHeight - scrollTop - clientHeight < 50);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);

    const messageData = {
      senderId: auth.currentUser.uid,
      content: newMessage.trim(),
      timestamp: Timestamp.fromDate(new Date()),
      read: false,
    };
    const docSnapshot = await getDoc(conversationRef);
    if (docSnapshot.exists()) {
      await updateDoc(conversationRef, {
        messages: [...messages, messageData],
        typingUsers:
          docSnapshot
            .data()
            .typingUsers?.filter((uid) => uid !== auth.currentUser.uid) || [],
      });
    } else {
      await setDoc(conversationRef, {
        userIds,
        messages: [messageData],
        typingUsers: [],
      });
    }
    setNewMessage("");
    fetchUnreadCounts();
  };

  const handleEditMessage = async (index) => {
    if (!editContent.trim()) return;
    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);
    const updatedMessages = messages.map((msg, idx) =>
      idx === index ? { ...msg, content: editContent.trim() } : msg
    );
    try {
      await updateDoc(conversationRef, { messages: updatedMessages });
      setEditingMessageId(null);
      setEditContent("");
      fetchUnreadCounts();
    } catch (err) {
      setError("Failed to edit message: " + err.message);
    }
  };

  const handleDeleteMessage = async (index) => {
    const userIds = [auth.currentUser.uid, selectedUser.id].sort();
    const conversationId = userIds.join("_");
    const conversationRef = doc(db, "text", conversationId);
    const updatedMessages = messages.filter((_, idx) => idx !== index);
    try {
      await updateDoc(conversationRef, { messages: updatedMessages });
      fetchUnreadCounts();
    } catch (err) {
      setError("Failed to delete message: " + err.message);
    }
  };

  const handleUpdateProfile = async () => {
    setSaveLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        about: formData.about,
        userNumber: formData.userNumber,
        fullname: formData.fullname,
        visibility: formData.visibility,
      });
      setCurrentUserProfile({
        ...currentUserProfile,
        about: formData.about,
        userNumber: formData.userNumber,
        fullname: formData.fullname,
        visibility: formData.visibility,
      });
      setShowUpdateModal(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setFormData({
      ...formData,
      visibility: {
        ...formData.visibility,
        [field]: !formData.visibility[field],
      },
    });
  };

  dotWave.register();

  if (loading) {
    return (
      <div style={{ ...styles.spinnerContainer, height: "100vh" }}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FaArrowCircleLeft size={20} /> Go Back
          </button>
          <h2 style={styles.title}>Texting</h2>
        </div>
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <h2 style={styles.title}>DIRECT MESSAGES</h2>
      </div>
      <div style={styles.content}>
        <div style={styles.userListContainer}>
          <h3 style={styles.sectionTitle}>Users in {currentUserProgram}</h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "10px",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px",
                width: "90%",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              style={{
                padding: "8px 12px",
                backgroundColor: showUnreadOnly ? "#007bff" : "green",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                width: "50%",
              }}
            >
              {showUnreadOnly ? "All Chats" : `Unread-(${totalUnread})`}
            </button>
          </div>
          {filteredUsers.length === 0 ? (
            <p style={styles.noDataMessage}>No users found..... Sorry</p>
          ) : (
            <ul style={styles.userList}>
              {filteredUsers.map((user) => (
                <li
                  key={user.id}
                  style={{
                    ...styles.userItem,
                    backgroundColor:
                      selectedUser?.id === user.id ? "#e0e0e0" : "#fff",
                  }}
                  onClick={() => {
                    setSelectedUser(user);
                    fetchUnreadCounts();
                  }}
                >
                  <span>{user.username}</span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: user.status === "online" ? "green" : "#888",
                      }}
                    >
                      {user.status}
                    </span>
                    {unreadCounts[user.id] > 0 && (
                      <span style={styles.badge}>{unreadCounts[user.id]}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={styles.chatContainer}>
          {selectedUser ? (
            <>
              <div style={styles.chatHeader}>
                <div>
                  <h3 style={styles.sectionTitle}>
                    Chat with {selectedUser.username}
                  </h3>
                  {selectedUserProfile?.visibility?.lastActivity !== false &&
                    selectedUserProfile && (
                      <p style={styles.lastSeen}>
                        {formatLastSeen(
                          selectedUserProfile.lastActivity,
                          selectedUserProfile.status
                        )}
                      </p>
                    )}
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={styles.closeButton}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div ref={messageContainerRef} style={styles.messageContainer}>
                {messages.length === 0 ? (
                  <p style={styles.noDataMessage}>
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.messageBubble,
                          alignSelf:
                            msg.senderId === auth.currentUser.uid
                              ? "flex-end"
                              : "flex-start",
                          backgroundColor:
                            msg.senderId === auth.currentUser.uid
                              ? "#007bff"
                              : "#f1f1f1",
                          color:
                            msg.senderId === auth.currentUser.uid
                              ? "white"
                              : "black",
                          position: "relative",
                        }}
                        onMouseEnter={() =>
                          msg.senderId === auth.currentUser.uid &&
                          setHoveredMessageId(index)
                        }
                        onMouseLeave={() =>
                          msg.senderId === auth.currentUser.uid &&
                          setHoveredMessageId(null)
                        }
                      >
                        {editingMessageId === index ? (
                          <div style={styles.editContainer}>
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              style={{
                                ...styles.messageInput,
                                width: "100%",
                                marginBottom: "5px",
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleEditMessage(index);
                                }
                              }}
                            />
                            <div style={styles.editButtons}>
                              <button
                                onClick={() => handleEditMessage(index)}
                                style={{
                                  backgroundColor: "#4CAF50",
                                  color: "white",
                                  padding: "8px 16px",
                                  marginRight: "10px",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  transition: "background-color 0.3s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#45a049")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#4CAF50")
                                }
                              >
                                Send
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMessageId(null);
                                  setEditContent("");
                                }}
                                style={{
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  padding: "8px 16px",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  transition: "background-color 0.3s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#d32f2f")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.backgroundColor =
                                    "#f44336")
                                }
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p style={styles.messageText}>{msg.content}</p>
                            <div style={styles.messageFooter}>
                              <p style={styles.messageTimestamp}>
                                {msg.timestamp
                                  .toDate()
                                  .toLocaleString("en-US", {
                                    timeStyle: "short",
                                  })}
                              </p>
                              {msg.senderId === auth.currentUser.uid && (
                                <span style={styles.readIndicator}>
                                  {msg.read ? (
                                    <FaCheckDouble size={12} />
                                  ) : (
                                    <FaCheck size={12} />
                                  )}
                                </span>
                              )}
                            </div>
                            {msg.senderId === auth.currentUser.uid &&
                              hoveredMessageId === index && (
                                <div style={styles.messageActions}>
                                  <button
                                    onClick={() => {
                                      setEditingMessageId(index);
                                      setEditContent(msg.content);
                                    }}
                                    style={styles.actionButton}
                                    title="Edit Message"
                                  >
                                    <FaEdit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMessage(index)}
                                    style={styles.actionButton}
                                    title="Delete Message"
                                  >
                                    <FaTrash size={16} />
                                  </button>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div
                        style={{
                          ...styles.messageBubble,
                          alignSelf: "flex-start",
                          backgroundColor: "#f1f1f1",
                        }}
                      >
                        <l-dot-wave
                          size="20"
                          speed="1"
                          color="#333"
                        ></l-dot-wave>
                        <span style={{ marginLeft: "10px" }}>
                          {selectedUser.username} is typing...
                        </span>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>
              {!isAtBottom && (
                <button
                  style={styles.scrollButton}
                  onClick={() => {
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  aria-label="Jump to latest message"
                >
                  <FaArrowDown size={20} />
                </button>
              )}
              <div style={styles.inputContainer}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={styles.messageInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <p style={styles.noDataMessage}>Select a user to start chatting.</p>
          )}
        </div>
        <div style={styles.profileContainer}>
          <h3 style={styles.sectionTitle}>
            {loadingProfile
              ? "Loading Profile..."
              : selectedUserProfile
              ? `${selectedUserProfile.username || "User"}'s Profile`
              : "User Profile"}
          </h3>
          <div style={styles.profilePictureContainer}>
            <img
              src={logo1}
              alt="Study Group Logo"
              style={styles.profilePicture}
            />
          </div>
          {!selectedUser ? (
            <p style={styles.noDataMessage}>
              Please select a user to view their profile.
            </p>
          ) : loadingProfile ? (
            <div style={styles.spinnerContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.noDataMessage}>Loading profile...</p>
            </div>
          ) : selectedUserProfile ? (
            <div style={styles.profileDetails}>
              {selectedUserProfile.visibility?.username !== false && (
                <p style={styles.profileField}>
                  <strong>Username:</strong>
                  <br />{" "}
                  <span style={{ marginLeft: "10px" }}>
                    {selectedUserProfile.username || "Unknown"}
                  </span>
                </p>
              )}
              {selectedUserProfile.visibility?.fullname !== false && (
                <p style={styles.profileField}>
                  <strong>Full Name:</strong>
                  <br />{" "}
                  <span style={{ marginLeft: "10px" }}>
                    {selectedUserProfile.fullname || "Unknown"}
                  </span>
                </p>
              )}
              {selectedUserProfile.visibility?.userNumber !== false && (
                <p style={styles.profileField}>
                  <strong>Contact Number:</strong>
                  <br />{" "}
                  <span style={{ marginLeft: "10px" }}>
                    {selectedUserProfile.userNumber || "Unknown"}
                  </span>
                </p>
              )}
              {selectedUserProfile.visibility?.programOfStudy !== false && (
                <p style={styles.profileField}>
                  <strong>Program of Study:</strong>
                  <br />{" "}
                  <span style={{ marginLeft: "10px" }}>
                    {selectedUserProfile.programOfStudy || "Unknown"}
                  </span>
                </p>
              )}
              {selectedUserProfile.visibility?.levelOfStudy !== false && (
                <p style={styles.profileField}>
                  <strong>Level of Study:</strong>
                  <br />{" "}
                  <span style={{ marginLeft: "10px" }}>
                    {selectedUserProfile.levelOfStudy || "Unknown"}
                  </span>
                </p>
              )}
              {selectedUserProfile.visibility?.about !== false && (
                <p style={styles.profileField}>
                  <strong>About {selectedUserProfile.username}:</strong>
                  <br />{" "}
                  <span style={{ textAlign: "justify", display: "block" }}>
                    {selectedUserProfile.about || "No About"}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p style={styles.noDataMessage}>
              Select a user to view their profile.
            </p>
          )}
        </div>
      </div>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft size={20} /> Go Back
      </button>
      <button
        onClick={() => {
          setInitialFormData(formData);
          setShowUpdateModal(true);
        }}
        style={styles.updateButton}
      >
        <FaSync size={20} /> My Profile
      </button>

      {showUpdateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.sectionTitle}>Update Profile</h2>
            <div style={styles.formContainer}>
              <label style={styles.formLabel}>Full Name</label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                style={styles.formInput}
                placeholder="Your full name..."
              />

              <label style={styles.formLabel}>About Me</label>
              <textarea
                type="text"
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                style={styles.textarea}
                placeholder="Tell us about yourself..."
                rows="5"
              />

              <div style={{ display: "flex", gap: "2rem" }}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show Full Name on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.fullname}
                        onChange={() => toggleVisibility("fullname")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show About Me on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.about}
                        onChange={() => toggleVisibility("about")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show Username on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.username}
                        onChange={() => toggleVisibility("username")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>Show Last Seen</label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.lastActivity}
                        onChange={() => toggleVisibility("lastActivity")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show Contact on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.userNumber}
                        onChange={() => toggleVisibility("userNumber")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show Program of Study on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.programOfStudy}
                        onChange={() => toggleVisibility("programOfStudy")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    <label style={styles.formLabel}>
                      Show Level of Study on Profile
                    </label>
                    <label style={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={formData.visibility.levelOfStudy}
                        onChange={() => toggleVisibility("levelOfStudy")}
                        style={styles.toggleInput}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.modalButtons}>
                <button
                  onClick={handleUpdateProfile}
                  style={styles.submitButton}
                >
                  {saveLoading ? (
                    <div className="spinner-button">
                      Updating Profile{" "}
                      <l-dot-wave
                        size="20"
                        speed="1"
                        color="white"
                      ></l-dot-wave>
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  onClick={() => {
                    setFormData(initialFormData);
                    setShowUpdateModal(false);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    width: "95%",
    margin: "0 auto",
    padding: "20px",
    color: "#333",
    minHeight: "95vh",
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
  },
  background: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    opacity: 0.3,
    zIndex: -1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    padding: "10px",
    width: "98%",
    boxShadow: "0 4px 4px rgba(0,0,0,0.8)",
    borderRadius: "10px",
    marginTop: "20px",
  },
  backButton: {
    background: "none",
    border: "2px solid #ddd",
    cursor: "pointer",
    color: "#007bff",
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    position: "fixed",
    bottom: "32px",
    left: "30px",
    padding: "15px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.7)",
    borderRadius: "10px",
    textTransform: "uppercase",
    width: "22.5%",
    justifyContent: "center",
    gap: "10px",
  },
  updateButton: {
    background: "none",
    border: "2px solid #ddd",
    cursor: "pointer",
    color: "#007bff",
    display: "flex",
    alignItems: "center",
    fontSize: "20px",
    position: "fixed",
    bottom: "32px",
    right: "30px",
    padding: "15px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.7)",
    borderRadius: "10px",
    textTransform: "uppercase",
    width: "22.5%",
    justifyContent: "center",
    gap: "10px",
  },
  title: {
    fontSize: "40px",
    margin: 0,
    color: "#333",
  },
  content: {
    display: "flex",
    gap: "20px",
    height: "80vh",
  },
  userListContainer: {
    width: "25%",
    borderRight: "1px solid #ddd",
    padding: "10px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "10px",
    maxHeight: "70vh",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#555",
    textAlign: "center",
  },
  userList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    maxHeight: "57vh",
    overflowY: "auto",
  },
  userItem: {
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.2s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
  },
  chatContainer: {
    width: "50%",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    boxShadow: "0 8px 4px rgba(0,0,0,0.8)",
    borderRadius: "10px",
  },
  chatHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "5px",
  },
  lastSeen: {
    fontSize: "16px",
    color: "#666",
    marginLeft: "10px",
  },
  closeButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#dc3545",
    fontSize: "20px",
    padding: "5px",
  },
  messageContainer: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    backgroundColor: "transparent",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
    marginBottom: "10px",
  },
  messageText: {
    margin: 0,
    fontSize: "18px",
  },
  messageTimestamp: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.7,
  },
  messageFooter: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "5px",
    justifyContent: "space-between",
  },
  readIndicator: {
    display: "flex",
    alignItems: "center",
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  messageInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    resize: "none",
    height: "50px",
    fontSize: "18px",
  },
  messageActions: {
    top: "8px",
    display: "flex",
    gap: "5px",
    position: "relative",
  },
  actionButton: {
    background: "rgba(0, 0, 0, 0.7)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editContainer: {
    display: "flex",
    flexDirection: "column",
    width: "90%",
  },
  editButtons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
  },
  sendButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "20px",
  },
  profileContainer: {
    width: "25%",
    borderLeft: "1px solid #ddd",
    padding: "10px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "10px",
    maxHeight: "70vh",
  },
  profileDetails: {
    padding: "10px",
    overflowY: "auto",
    maxHeight: "37vh",
  },
  profileField: {
    margin: "10px 0",
    fontSize: "16px",
    color: "#333",
  },
  profilePictureContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "10px",
  },
  profilePicture: {
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "80%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  formLabel: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "5px",
  },
  formInput: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "16px",
  },
  textarea: {
    width: "98.3%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    marginBottom: "15px",
    resize: "vertical",
  },
  modalButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.7)",
    borderRadius: "8px",
    padding: "8px",
    justifyContent: "space-evenly",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bolder",
    width: "45%",
  },
  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "bolder",
    width: "45%",
  },
  noDataMessage: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    fontSize: "25px",
    marginTop: "100px",
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "20px",
    color: "#dc3545",
  },
  errorMessage: {
    fontSize: "16px",
  },
  badge: {
    backgroundColor: "green",
    color: "white",
    borderRadius: "50%",
    width: "15px",
    height: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "8px",
    fontWeight: "bold",
  },
  scrollButton: {
    marginTop: "5px",
    marginBottom: "5px",
    padding: "8px 12px",
    color: "black",
    border: "none",
    cursor: "pointer",
    alignSelf: "center",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "8px",
    width: "10%",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#333",
  },
  toggleInput: {
    width: "20px",
    height: "20px",
  },
};
const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${keyframes}</style>`);

export default TextingScreen;
