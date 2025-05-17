import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, onSnapshot, getDocs, deleteDoc, query, where, Timestamp, doc, getDoc } from "firebase/firestore";
import logo from "../assets/main.jpg";

const WeeklyLeaderBoard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState({});
  const [userStudyDetails, setUserStudyDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserStudyDetails = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserStudyDetails({
            programOfStudy: userData.programOfStudy,
            levelOfStudy: userData.levelOfStudy,
            semesterOfStudy: userData.semesterOfStudy
          });
        } else {
          navigate('/profile');
        }
      } else {
        navigate('/login');
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
    const resetOldScores = async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const resetQuery = query(
        collection(db, "dailyQuizzes"),
        where("timestamp", "<", Timestamp.fromDate(oneWeekAgo))
      );
      const resetSnapshot = await getDocs(resetQuery);
      const deletePromises = resetSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    };

    fetchUserStudyDetails();
    fetchUserData();
    resetOldScores();
  }, [navigate]);

  useEffect(() => {
    if (!userStudyDetails) return;
    const scoresQuery = query(
      collection(db, "dailyQuizzes"),
      where("programOfStudy", "==", userStudyDetails.programOfStudy),
      where("levelOfStudy", "==", userStudyDetails.levelOfStudy),
      where("semesterOfStudy", "==", userStudyDetails.semesterOfStudy)
    );

    const unsubscribe = onSnapshot(scoresQuery, (querySnapshot) => {
      const scores = querySnapshot.docs.map((doc) => doc.data());
      const groupedByCourse = scores.reduce((acc, score) => {
        const course = score.course;
        if (!acc[course]) {
          acc[course] = [];
        }
        acc[course].push(score);
        return acc;
      }, {});

      const leaderboardWithUsernames = {};
      for (const course in groupedByCourse) {
        const userScores = groupedByCourse[course].reduce((acc, score) => {
          const userId = score.userId;
          if (!acc[userId]) {
            acc[userId] = { userId, totalScore: 0, totalQuestions: 0 };
          }
          acc[userId].totalScore += score.score;
          acc[userId].totalQuestions += score.totalQuestions;
          return acc;
        }, {});
        leaderboardWithUsernames[course] = Object.values(userScores)
          .map((entry) => ({
            userId: entry.userId,
            username: usersData[entry.userId] || "Loading...",
            totalScore: entry.totalScore,
            totalQuestions: entry.totalQuestions,
            average: entry.totalQuestions > 0 ? (entry.totalScore / entry.totalQuestions).toFixed(2) : "0.00",
            percent: entry.totalQuestions > 0 ? Math.round(((entry.totalScore/10) / entry.totalQuestions) * 100): 0}))
          .sort((a, b) => b.average - a.average);
      }
      setLeaderboardData(leaderboardWithUsernames);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userStudyDetails, usersData]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Leaderboard...</p>
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
        {/* <div style={styles.buttonContain}>
          <button onClick={() => navigate('/live-quiz')} style={styles.backButton}>
            Live Quizzes <FaArrowAltCircleRight size={20} />
          </button>
        </div> */}
        <h2 style={{ fontSize: "36px" }}>WEEKLY LEADERBOARD</h2>
      </div>
      <div style={styles.scrollableContainer}>
        {Object.keys(leaderboardData).length === 0 ? (
          <div style={styles.noDataContainer}>
            <p style={styles.noDataMessage}>No leaderboard data available for your program.</p>
          </div>
        ) : (
          <div>
            {Object.keys(leaderboardData).map((course, index) => (
              <div key={index} style={styles.courseContainer}>
                <h3>{course}</h3>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.tableHeaderCell}>Rank</th>
                      <th style={styles.tableHeaderCell}>Name</th>
                      <th style={styles.tableHeaderCell}>Total Score</th>
                      <th style={styles.tableHeaderCell}>Total Questions</th>
                      <th style={styles.tableHeaderCell}>Average</th>
                      <th style={styles.tableHeaderCell}>Percentage Pass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData[course].map((user, idx) => (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.tableCell}>{idx + 1}</td>
                        <td style={styles.tableCell}>{user.username}</td>
                        <td style={styles.tableCell}>{user.totalScore}</td>
                        <td style={styles.tableCell}>{user.totalQuestions}</td>
                        <td style={styles.tableCell}>{user.average}</td>
                        <td style={{...styles.tableCell, fontWeight: '800', color: user.percent < 50 ? 'red': user.percent < 80 ? 'orange' : 'green'}}>{user.percent} %</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
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
    marginBottom: '90px',
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
  noDataContainer: {
    padding: "20px",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "0 8px 12px rgba(0, 0, 0, 0.8)",
    position: 'fixed',
    top: '30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: "90%"
  },
  noDataMessage: {
    fontSize: "50px",
    color: "#555",
    fontWeight: 'bolder'
  },
  courseContainer: {
    marginBottom: "40px",
  },
  buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "15px",
  },
  buttonContain: {
    position: "absolute",
    top: "40px",
    right: "30px",
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

export default WeeklyLeaderBoard;