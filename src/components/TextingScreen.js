import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowCircleLeft,
  FaPaperPlane,
  FaSync,
  FaTimes,
  FaArrowDown,
} from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import logo from "../assets/op.jpg";

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
  const [formData, setFormData] = useState({
    about: "",
  });
  const messageContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const currentUserDoc = await getDoc(
          doc(db, "users", auth.currentUser.uid)
        );
        if (!currentUserDoc.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }
        const userData = currentUserDoc.data();
        setCurrentUserProgram(userData.programOfStudy || "");

        const usersQuery = query(
          collection(db, "users"),
          where("programOfStudy", "==", userData.programOfStudy),
          where("role", "!=", "admin")
        );
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersList = snapshot.docs
            .filter((doc) => doc.id !== auth.currentUser.uid)
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
  }, [navigate]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const textQuery = query(
      collection(db, "text"),
      where("userIds", "array-contains", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(textQuery, (querySnapshot) => {
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
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserProfile(null);
      setMessages([]);
      return;
    }

    const fetchSelectedUserProfile = async () => {
      setLoadingProfile(true);
      try {
        const userDoc = await getDoc(doc(db, "users", selectedUser.id));
        if (userDoc.exists()) {
          setSelectedUserProfile(userDoc.data());
        } else {
          setError("Selected user's profile not found.");
        }
      } catch (err) {
        setError("Failed to load user profile: " + err.message);
      } finally {
        setLoadingProfile(false);
      }
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
  }, [messages]);

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

    try {
      const docSnapshot = await getDoc(conversationRef);
      if (docSnapshot.exists()) {
        await updateDoc(conversationRef, {
          messages: [...messages, messageData],
        });
      } else {
        await setDoc(conversationRef, {
          userIds,
          messages: [messageData],
        });
      }
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message: " + err.message);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        about: formData.about,
      });
      setCurrentUserProfile({
        ...currentUserProfile,
        ...formData,
      });
      setShowUpdateModal(false);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    }
  };

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
          {usersInProgram.length === 0 ? (
            <p style={styles.noDataMessage}>No other users in your program.</p>
          ) : (
            <ul style={styles.userList}>
              {usersInProgram.map((user) => (
                <li
                  key={user.id}
                  style={{
                    ...styles.userItem,
                    backgroundColor:
                      selectedUser?.id === user.id ? "#e0e0e0" : "#fff",
                  }}
                  onClick={() => setSelectedUser(user)}
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
                <h3 style={styles.sectionTitle}>
                  Chat with {selectedUser.username}
                </h3>
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
                        }}
                      >
                        <p style={styles.messageText}>{msg.content}</p>
                        <p style={styles.messageTimestamp}>
                          {msg.timestamp.toDate().toLocaleString("en-US", {
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    ))}
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
                  aria-label="Jumpt to latest message"
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
                />
                <button onClick={handleSendMessage} style={styles.sendButton}>
                  <FaPaperPlane /> Send
                </button>
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
              : `${selectedUserProfile?.username || "User"}'s Profile`}
          </h3>
          <div style={styles.profilePictureContainer}>
            <img
              src={logo}
              alt="Study Group Logo"
              style={styles.profilePicture}
            />
          </div>
          {selectedUser && (
            <>
              {loadingProfile ? (
                <div style={styles.spinnerContainer}>
                  <div style={styles.spinner}></div>
                  <p style={styles.noDataMessage}>Loading profile...</p>
                </div>
              ) : selectedUserProfile ? (
                <div style={styles.profileDetails}>
                  <p style={styles.profileField}>
                    <strong>Username:</strong>
                    <br />{" "}
                    <span style={{ marginLeft: "10px" }}>
                      {selectedUserProfile.username || "Unknown"}
                    </span>
                  </p>
                  <p style={styles.profileField}>
                    <strong>Program of Study:</strong>
                    <br />{" "}
                    <span style={{ marginLeft: "10px" }}>
                      {selectedUserProfile.programOfStudy || "Unknown"}
                    </span>
                  </p>
                  <p style={styles.profileField}>
                    <strong>Level of Study:</strong>
                    <br />{" "}
                    <span style={{ marginLeft: "10px" }}>
                      {selectedUserProfile.levelOfStudy || "Unknown"}
                    </span>
                  </p>
                  <p style={styles.profileField}>
                    <strong>About {selectedUserProfile.username}:</strong>
                    <br />{" "}
                    <span style={{ textAlign: "justify", display: "block" }}>
                      {selectedUserProfile.about || "No About"}
                    </span>
                  </p>
                </div>
              ) : (
                <p style={styles.noDataMessage}>
                  Select a user to view their profile.
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft size={20} /> Go Back
      </button>
      <button
        onClick={() => setShowUpdateModal(true)}
        style={styles.updateButton}
      >
        <FaSync size={20} /> Update My Profile
      </button>

      {showUpdateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.sectionTitle}>Update Profile</h2>
            <div style={styles.formContainer}>
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
              <div style={styles.modalButtons}>
                <button
                  onClick={handleUpdateProfile}
                  style={styles.submitButton}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowUpdateModal(false)}
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
    left: "50px",
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
    right: "50px",
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
    maxHeight: "60vh",
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
    marginBottom: "10px",
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
  },
  messageText: {
    margin: 0,
    fontSize: "18px",
  },
  messageTimestamp: {
    margin: 0,
    fontSize: "12px",
    opacity: 0.7,
    marginTop: "5px",
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
    fontSize: "16px",
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
};

export default TextingScreen;
