import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
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
import logo from "../assets/main.jpg";

const TopPerformers = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
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

    fetchUserRole();
    fetchUserData();
  }, [navigate]);

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
        <h2 style={{ fontSize: "36px" }}>TOP PERFORMERS</h2>
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
      <div style={styles.footer}>
        <p>© 2025 StudyGroup. All rights reserved.</p>
      </div>
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
    top: 128,
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
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    zIndex: 10,
    opacity: "0.7",
  },
  scrollableContainer: {
    marginTop: "130px",
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
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
  },
  noDataMessage: {
    fontSize: "50px",
    color: "#555",
    fontWeight: "bolder",
  },
  buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "15px",
  },
  footer: {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    padding: "15px",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    fontSize: "1.1rem",
    fontFamily: "Poppins, sans-serif",
  },
};

export default TopPerformers;
