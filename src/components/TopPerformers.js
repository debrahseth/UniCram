import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaEnvelope } from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import logo from "../assets/op.jpg";

const TopPerformers = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState({});
  const [allUsersData, setAllUsersData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageError, setMessageError] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");
  const [sendOption, setSendOption] = useState("individual");
  const [sendLoading, setSendLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === "admin");
          if (userData.role !== "admin") {
            navigate("/dashboard");
          }
        } else {
          navigate("/profile");
        }
      } else {
        navigate("/login");
      }
    };

    const fetchUserData = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const users = {};
      userSnapshot.forEach((doc) => {
        const data = doc.data();
        users[doc.id] = data.username || "No Name";
      });
      setUsersData(users);
    };

    const fetchAllUsersData = async () => {
      const userSnapshot = await getDocs(collection(db, "users"));
      const users = {};
      userSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "admin") {
          return;
        }
        users[doc.id] = {
          username: data.username || "No Name",
          level: data.levelOfStudy || "Unknown",
          program: data.programOfStudy || "Unknown",
        };
      });
      setAllUsersData(users);
    };

    fetchUserRole();
    fetchUserData();
    fetchAllUsersData();
  }, [navigate]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (!usersData || Object.keys(usersData).length === 0) return;

    const scoresQuery = collection(db, "dailyQuizzes");
    const unsubscribe = onSnapshot(scoresQuery, (querySnapshot) => {
      const scores = querySnapshot.docs.map((doc) => doc.data());

      const userScores = scores.reduce((acc, score) => {
        const userId = score.userId;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            totalScore: 0,
            totalQuestions: 0,
          };
        }
        acc[userId].totalScore += score.score;
        acc[userId].totalQuestions += score.totalQuestions;
        return acc;
      }, {});

      const topPerformers = Object.values(userScores)
        .map((entry) => ({
          userId: entry.userId,
          username: usersData[entry.userId] || "Loading...",
          totalScore: entry.totalScore,
          totalQuestions: entry.totalQuestions,
          average:
            entry.totalQuestions > 0
              ? (entry.totalScore / entry.totalQuestions).toFixed(2)
              : "0.00",
          percent:
            entry.totalQuestions > 0
              ? Math.round((entry.totalScore / 10 / entry.totalQuestions) * 100)
              : 0,
        }))
        .sort((a, b) => b.average - a.average)
        .slice(0, 10);

      setTopUsers(topPerformers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [usersData]);

  const sendCongratulatoryMessage = async (userId, username) => {
    try {
      const messageDocRef = doc(db, "messages", `${userId}_${Date.now()}`);
      await setDoc(messageDocRef, {
        userId,
        message: `Congratulations ${username}! You've been recognized as a top performer on the leaderboard! 🎉 Keep up the great work!`,
        timestamp: Timestamp.fromDate(new Date()),
        read: false,
      });
      alert(`Congratulatory message sent to ${username}!`);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const programs = [
    ...new Set(Object.values(allUsersData).map((user) => user.program)),
  ].sort();
  const levels = [
    ...new Set(Object.values(allUsersData).map((user) => user.level)),
  ].sort();

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageError("Please enter a message to send.");
      return;
    }

    setMessageError("");
    setMessageSuccess("");
    setSendLoading(true);

    try {
      let recipients = [];

      if (sendOption === "individual") {
        if (!selectedUserId) {
          setMessageError("Please select a user to send the message to.");
          return;
        }
        recipients = [selectedUserId];
      } else {
        recipients = Object.keys(allUsersData).filter((userId) => {
          const user = allUsersData[userId];
          switch (sendOption) {
            case "sameLevelProgram":
              if (!selectedProgram || !selectedLevel) {
                setMessageError("Please select both a program and a level.");
                return false;
              }
              return (
                user.level === selectedLevel && user.program === selectedProgram
              );
            case "sameProgram":
              if (!selectedProgram) {
                setMessageError("Please select a program.");
                return false;
              }
              return user.program === selectedProgram;
            case "sameLevel":
              if (!selectedLevel) {
                setMessageError("Please select a level.");
                return false;
              }
              return user.level === selectedLevel;
            default:
              return false;
          }
        });

        if (recipients.length === 0) {
          setMessageError("No users match the selected criteria.");
          return;
        }
      }

      const sendPromises = recipients.map(async (userId) => {
        const messageDocRef = doc(
          db,
          "messages",
          `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        );
        await setDoc(messageDocRef, {
          userId,
          message: messageContent,
          timestamp: Timestamp.fromDate(new Date()),
          read: false,
        });
      });

      await Promise.all(sendPromises);

      const recipientCount = recipients.length;
      setMessageSuccess(
        `Message${
          recipientCount > 1 ? "s" : ""
        } sent successfully to ${recipientCount} user${
          recipientCount > 1 ? "s" : ""
        }!`
      );
      setMessageContent("");
      setSelectedUserId("");
      setSelectedProgram("");
      setSelectedLevel("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageError("Failed to send message. Please try again.");
    } finally {
      setSendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Top Performers...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <div style={styles.buttonContainer}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FaArrowCircleLeft size={20} /> Go Back
          </button>
        </div>
        <h2 style={{ fontSize: "40px" }}>TOP PERFORMERS</h2>
        <div style={styles.messageButtonContainer}>
          <button
            onClick={() => setShowMessageModal(true)}
            style={styles.messageButton}
          >
            <FaEnvelope size={20} /> Send Message
          </button>
        </div>
      </div>
      <div style={styles.scrollableContainer}>
        {topUsers.length === 0 ? (
          <div style={styles.noDataContainer}>
            <p style={styles.noDataMessage}>No top performers available.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableHeaderCell}>Rank</th>
                <th style={styles.tableHeaderCell}>Name</th>
                <th style={styles.tableHeaderCell}>Total Score</th>
                <th style={styles.tableHeaderCell}>Total Questions</th>
                <th style={styles.tableHeaderCell}>Average</th>
                <th style={styles.tableHeaderCell}>Percentage</th>
                <th style={styles.tableHeaderCell}>Action</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.tableCell}>{idx + 1}</td>
                  <td style={styles.tableCell}>{user.username}</td>
                  <td style={styles.tableCell}>{user.totalScore}</td>
                  <td style={styles.tableCell}>{user.totalQuestions}</td>
                  <td style={styles.tableCell}>{user.average}</td>
                  <td
                    style={{
                      ...styles.tableCell,
                      fontWeight: "800",
                      color:
                        user.percent < 50
                          ? "red"
                          : user.percent < 80
                          ? "orange"
                          : "green",
                    }}
                  >
                    {user.percent} %
                  </td>
                  <td style={styles.tableCell}>
                    <button
                      style={styles.actionButton}
                      onClick={() =>
                        sendCongratulatoryMessage(user.userId, user.username)
                      }
                    >
                      Send Congrats 🎉
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div style={styles.scrollingContainer}>
        <div style={styles.scrollingText}>
          🌟 Every small effort you make today builds the success of tomorrow.
          Keep pushing, keep learning — your dreams are worth it! 🌟 Your
          journey matters. Keep striving, keep growing. Prime Academy believes
          in you! 🌟 Success is the sum of small efforts repeated every day.
          Keep pushing! 🌟 You’re not just studying — you’re building a future
          to be proud of. 🌟 Every quiz you take is one step closer to mastering
          your field! 🌟      🌟 Every small effort you make today builds the
          success of tomorrow. Keep pushing, keep learning — your dreams are
          worth it! 🌟 Your journey matters. Keep striving, keep growing. Prime
          Academy believes in you! 🌟 Success is the sum of small efforts
          repeated every day. Keep pushing! 🌟 You’re not just studying — you’re
          building a future to be proud of. 🌟 Every quiz you take is one step
          closer to mastering your field! 🌟
        </div>
      </div>

      {showMessageModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Send Message to User</h2>
            <div style={{ marginBottom: "20px" }}>
              <div style={modalStyles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    value="individual"
                    checked={sendOption === "individual"}
                    onChange={(e) => setSendOption(e.target.value)}
                  />{" "}
                  Individual
                </label>
                <label>
                  <input
                    type="radio"
                    value="sameLevelProgram"
                    checked={sendOption === "sameLevelProgram"}
                    onChange={(e) => setSendOption(e.target.value)}
                  />{" "}
                  Same Level & Program
                </label>
                <label>
                  <input
                    type="radio"
                    value="sameProgram"
                    checked={sendOption === "sameProgram"}
                    onChange={(e) => setSendOption(e.target.value)}
                  />{" "}
                  Same Program
                </label>
                <label>
                  <input
                    type="radio"
                    value="sameLevel"
                    checked={sendOption === "sameLevel"}
                    onChange={(e) => setSendOption(e.target.value)}
                  />{" "}
                  Same Level
                </label>
              </div>

              {sendOption === "individual" ? (
                <div
                  style={{
                    borderRadius: "10px",
                    boxShadow: "0 4px 4px rgba(0,0,0,0.6)",
                    padding: "10px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <label style={{ fontWeight: "bold" }}>Select User:</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    style={modalStyles.dropdown}
                  >
                    <option value="">-- Select User --</option>
                    {Object.entries(allUsersData)
                      .sort(([, userA], [, userB]) =>
                        userA.username.localeCompare(userB.username)
                      )
                      .map(([userId, user]) => (
                        <option key={userId} value={userId}>
                          {user.username}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div style={modalStyles.selectionContainer}>
                  {(sendOption === "sameLevelProgram" ||
                    sendOption === "sameProgram") && (
                    <div style={modalStyles.selectionItem}>
                      <label
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      >
                        Select Program:
                      </label>
                      <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        style={modalStyles.dropdown}
                      >
                        <option value="">-- Select Program --</option>
                        {programs.map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {(sendOption === "sameLevelProgram" ||
                    sendOption === "sameLevel") && (
                    <div style={modalStyles.selectionItem}>
                      <label
                        style={{ marginRight: "10px", fontWeight: "bold" }}
                      >
                        Select Level:
                      </label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        style={modalStyles.dropdown}
                      >
                        <option value="">-- Select Level --</option>
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <textarea
              placeholder="Type your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              style={modalStyles.textarea}
              rows="5"
            />
            {messageError && <p style={modalStyles.error}>{messageError}</p>}
            {messageSuccess && (
              <p style={modalStyles.success}>{messageSuccess}</p>
            )}
            <div style={modalStyles.buttonContainer}>
              <button
                onClick={handleSendMessage}
                style={modalStyles.sendButton}
              >
                {sendLoading ? (
                  <>
                    Sending{" "}
                    <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedUserId("");
                  setSelectedProgram("");
                  setSelectedLevel("");
                  setMessageContent("");
                  setMessageError("");
                  setMessageSuccess("");
                  setSendOption("individual");
                }}
                style={modalStyles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
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
    opacity: 0.5,
    zIndex: -1,
  },
  header: {
    position: "fixed",
    top: "10px",
    width: "90%",
    color: "black",
    padding: "8px",
    textAlign: "center",
    zIndex: 10,
    opacity: "0.9",
    left: "50%",
    transform: "translateX(-50%)",
    boxShadow: "0 8px 8px rgba(0,0,0,0.8)",
    borderRadius: "8px",
  },
  scrollableContainer: {
    marginTop: "150px",
    marginBottom: "90px",
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    opacity: "0.9",
  },
  backButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    borderRadius: "30px",
    padding: "10px 14px",
    fontSize: "25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.3s",
  },
  messageButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    borderRadius: "30px",
    padding: "10px 14px",
    fontSize: "25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.3s",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  tableHeader: {
    backgroundColor: "#4CAF50",
    color: "white",
    textAlign: "center",
  },
  tableHeaderCell: {
    padding: "10px",
    fontSize: "18px",
  },
  tableRow: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
  },
  tableCell: {
    padding: "20px",
    fontSize: "18px",
    textAlign: "center",
  },
  actionButton: {
    padding: "5px 10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  noDataContainer: {
    padding: "20px",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "0 8px 12px rgba(0, 0, 0, 0.8)",
    position: "fixed",
    top: "40%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
  },
  noDataMessage: {
    fontSize: "50px",
    color: "black",
    fontWeight: "bolder",
    textTransform: "uppercase",
  },
  buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "15px",
  },
  messageButtonContainer: {
    position: "absolute",
    top: "40px",
    right: "15px",
  },
  scrollingContainer: {
    position: "fixed",
    bottom: 10,
    left: 0,
    width: "100%",
    height: "40px",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 -8px 10px rgba(0,0,0,0.5)",
    animation: "flyIn 1.5s ease-out",
  },
  scrollingText: {
    display: "inline-block",
    whiteSpace: "nowrap",
    fontSize: "20px",
    color: "#333",
    animation: "scrollText 60s linear infinite",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "90%",
    maxHeight: "80vh",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center",
    textTransform: "uppercase",
  },
  radioGroup: {
    display: "flex",
    gap: "15px",
    marginBottom: "15px",
    flexWrap: "wrap",
    justifyContent: "center",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "8px",
    padding: "8px",
  },
  selectionContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "10px",
    padding: "10px",
    gap: "5px",
  },
  selectionItem: {
    display: "flex",
    flexDirection: "row",
  },
  dropdown: {
    padding: "5px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "300px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  textarea: {
    width: "97%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    marginBottom: "15px",
    resize: "vertical",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginBottom: "10px",
  },
  success: {
    color: "green",
    fontSize: "12px",
    marginBottom: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    boxShadow: "0 4px 4px rgba(0,0,0,0.6)",
    padding: "10px",
    borderRadius: "10px",
  },
  sendButton: {
    padding: "10px",
    fontSize: "20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "45%",
    fontWeight: "600",
  },
  closeButton: {
    padding: "10px",
    fontSize: "20px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    width: "45%",
    fontWeight: "600",
  },
};

const globalStyles = `
  @keyframes scrollText {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes flyIn {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0%);
      opacity: 1;
    }
  }
`;

export default TopPerformers;
