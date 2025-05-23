import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { Bar } from "react-chartjs-2";

const AdminDashboard = () => {
  const [message, setMessage] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizScoresLoading, setQuizScoresLoading] = useState(false);
  const [quizScoresError, setQuizScoresError] = useState(null);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    offlineUsers: 0,
    programDistribution: {},
    levelDistribution: {},
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");
  const navigate = useNavigate();
  const [showQuizScoresModal, setShowQuizScoresModal] = useState(false);
  const [quizScoresSummary, setQuizScoresSummary] = useState({
    averageScore: 0,
    topPerformers: [],
    scoresBySubject: {},
  });
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [displayMode, setDisplayMode] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const authInstance = getAuth();

  const programAbbreviations = {
    "Agricultural Engineering": "Agri Eng",
    "Aerospace Engineering": "Aero Eng",
    "Automobile Engineering": "Auto Eng",
    "Biomedical Engineering": "BioMed Eng",
    "Chemical Engineering": "Chem Eng",
    "Civil Engineering": "Civil Eng",
    "Computer Engineering": "Comp Eng",
    "Electrical and Electronics Engineering": "EEE",
    "Geological Engineering": "Geo Eng",
    "Geomatic Engineering": "Geom Eng",
    "Industrial Engineering": "Ind Eng",
    "Marine Engineering": "Marine Eng",
    "Materials Engineering": "Mat Eng",
    "Mechanical Engineering": "Mech Eng",
    "Metallurgical Engineering": "Metal Eng",
    "Petrochemical Engineering": "PetroChem Eng",
    "Petroleum Engineering": "Petrol Eng",
    "Telecommunications Engineering": "Telecom Eng",
  };

  const abbreviatedLabels = Object.keys(analytics.programDistribution).map(
    (program) => programAbbreviations[program] || program
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [authInstance]);

  useEffect(() => {
    const verifyAdmin = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        setError("Unauthorized access. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    };
    verifyAdmin();

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.role !== "admin");

        const totalUsers = usersList.length;
        const onlineUsers = usersList.filter(
          (user) => user.status === "online"
        ).length;
        const offlineUsers = totalUsers - onlineUsers;

        const programDistribution = usersList.reduce((acc, user) => {
          const program = user.programOfStudy || "Unknown";
          acc[program] = (acc[program] || 0) + 1;
          return acc;
        }, {});

        const levelDistribution = usersList.reduce((acc, user) => {
          const level = user.levelOfStudy || "Unknown";
          acc[level] = (acc[level] || 0) + 1;
          return acc;
        }, {});

        setAnalytics({
          totalUsers,
          onlineUsers,
          offlineUsers,
          programDistribution,
          levelDistribution,
        });
        setAnalyticsLoading(false);
      },
      (err) => {
        setAnalyticsError("Failed to load analytics data: " + err.message);
        setAnalyticsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let unsubscribeUsers;

    const fetchQuizScores = () => {
      setQuizScoresLoading(true);
      setQuizScoresError("");

      try {
        const usersRef = collection(db, "users");
        unsubscribeUsers = onSnapshot(
          usersRef,
          (usersSnapshot) => {
            let totalScore = 0;
            let totalQuizzes = 0;
            const allScores = [];

            const unsubscribes = [];

            usersSnapshot.docs.forEach((userDoc) => {
              const userData = userDoc.data();
              const username = userData.username || `User_${userDoc.id}`;
              const quizScoresRef = collection(
                db,
                "users",
                userDoc.id,
                "quizScores"
              );

              const unsubscribeQuiz = onSnapshot(
                quizScoresRef,
                (quizSnapshot) => {
                  quizSnapshot.docChanges().forEach((change) => {
                    if (change.type === "added" || change.type === "modified") {
                      const data = change.doc.data();
                      const scorePercentage = data.totalQuestions
                        ? (data.score / data.totalQuestions) * 100
                        : 0;
                      totalScore += data.score || 0;
                      totalQuizzes += 1;
                      allScores.push({
                        username,
                        level: userData.levelOfStudy || "Unknown",
                        program: userData.programOfStudy || "Unknown",
                        subject: data.subject || "Unknown",
                        score: data.score || 0,
                        totalQuestions: data.totalQuestions || 1,
                        percentage: scorePercentage.toFixed(1) + "%",
                      });
                    } else if (change.type === "removed") {
                      totalScore = 0;
                      totalQuizzes = 0;
                      allScores.length = 0;

                      usersSnapshot.docs.forEach((doc) => {
                        const userDataInner = doc.data();
                        const usernameInner =
                          userDataInner.username || `User_${doc.id}`;
                        const quizScoresRefInner = collection(
                          db,
                          "users",
                          doc.id,
                          "quizScores"
                        );
                        onSnapshot(quizScoresRefInner, (innerSnapshot) => {
                          innerSnapshot.forEach((quizDoc) => {
                            const data = quizDoc.data();
                            const scorePercentage = data.totalQuestions
                              ? (data.score / data.totalQuestions) * 100
                              : 0;
                            totalScore += data.score || 0;
                            totalQuizzes += 1;
                            allScores.push({
                              username: usernameInner,
                              level: userDataInner.levelOfStudy || "Unknown",
                              program:
                                userDataInner.programOfStudy || "Unknown",
                              subject: data.subject || "Unknown",
                              score: data.score || 0,
                              totalQuestions: data.totalQuestions || 1,
                              percentage: scorePercentage.toFixed(1) + "%",
                            });
                          });
                        });
                      });
                    }
                  });

                  if (totalQuizzes === 0) {
                    setQuizScoresError("No quiz scores found for any users.");
                  }

                  const averageScore =
                    totalQuizzes > 0 ? totalScore / totalQuizzes : 0;
                  const topPerformersByProgram = Object.entries(
                    allScores.reduce((acc, score) => {
                      const programKey = score.program;
                      acc[programKey] = acc[programKey] || {};
                      const levelKey = score.level;
                      acc[programKey][levelKey] =
                        acc[programKey][levelKey] || {};
                      const subjectKey = score.subject;
                      acc[programKey][levelKey][subjectKey] =
                        acc[programKey][levelKey][subjectKey] || [];
                      acc[programKey][levelKey][subjectKey].push(score);
                      return acc;
                    }, {})
                  ).map(([program, levels]) => ({
                    program,
                    levels: Object.entries(levels).map(([level, subjects]) => ({
                      level,
                      subjects: Object.entries(subjects).map(
                        ([subject, scores]) => ({
                          subject,
                          topPerformers: scores
                            .sort(
                              (a, b) =>
                                (b.score / b.totalQuestions || 0) -
                                (a.score / a.totalQuestions || 0)
                            )
                            .slice(0, 5)
                            .map((s) => ({
                              username: s.username,
                              score: s.score,
                              totalQuestions: s.totalQuestions,
                              percentage: s.percentage,
                            })),
                        })
                      ),
                    })),
                  }));

                  setQuizScoresSummary({
                    averageScore: averageScore.toFixed(1),
                    topPerformersByProgram,
                  });
                },
                (error) => {
                  setQuizScoresError(
                    "Failed to load quiz scores: " + error.message
                  );
                }
              );

              unsubscribes.push(unsubscribeQuiz);
            });

            usersSnapshot.docChanges().forEach((change) => {
              if (change.type === "removed") {
                unsubscribes.forEach((unsub) => unsub());
              }
            });
          },
          (error) => {
            setQuizScoresError("Failed to load users: " + error.message);
          }
        );
      } catch (error) {
        setQuizScoresError(
          "Failed to initialize quiz scores: " + error.message
        );
      } finally {
        setQuizScoresLoading(false);
      }
    };

    fetchQuizScores();

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const usersRef = collection(db, "users");
        const unsubscribe = onSnapshot(
          usersRef,
          (snapshot) => {
            const usersList = snapshot.docs
              .map((doc) => ({
                id: doc.id,
                username: doc.data().username || `User_${doc.id}`,
                levelOfStudy: doc.data().levelOfStudy || "Unknown",
                programOfStudy: doc.data().programOfStudy || "Unknown",
                status: doc.data().status || "offline",
                role: doc.data().role || "user",
              }))
              .filter((user) => user.id !== auth.currentUser?.uid);
            setUsers(usersList);
            setUsersLoading(false);
          },
          (err) => {
            setUsersError("Failed to load users: " + err.message);
            setUsersLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (error) {
        setUsersError("Failed to load users: " + error.message);
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSendMessage = async () => {
    if (!message) {
      setError("Please enter a message to send.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userEmails = usersSnapshot.docs
        .map((doc) => doc.data().email)
        .filter((email) => email);

      const adminEmail = auth.currentUser.email;
      const recipientEmails = userEmails.filter(
        (email) => email !== adminEmail
      );

      if (recipientEmails.length === 0) {
        setError("No users found to send the message to.");
        setLoading(false);
        return;
      }
      emailjs.init("J1JJdUVnwGNm1_468");

      const templateParams = {
        message: message,
        to: recipientEmails,
        from_name: "Prime Academy",
        subject: "Message from Prime Academy",
      };

      await emailjs.send("service_ocrml1s", "template_q2674x6", templateParams);

      setSuccess("Message sent successfully to all users!");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError("An error occurred while sending the message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    setError("");

    try {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        try {
          await updateDoc(userDocRef, {
            status: "offline",
          });
        } catch (error) {
          console.error("Failed to update user status:", error);
          setError("Failed to update status. Proceeding with logout...");
        }
      }
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to log out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setUpdateSuccess("");
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: currentStatus === "online" ? "offline" : "online",
      });
      setUpdateSuccess("User status updated successfully!");
    } catch (error) {
      setUsersError("Failed to update user status: " + error.message);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    setUpdateSuccess("");
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: currentRole === "admin" ? "user" : "admin",
      });
      setUpdateSuccess("User role updated successfully!");
    } catch (error) {
      setUsersError("Failed to update user role: " + error.message);
    }
  };

  // const handleDeleteUser = async (userId) => {
  //   if (
  //     !window.confirm(
  //       `Are you sure you want to delete the user with ID ${userId}? This action cannot be undone.`
  //     )
  //   ) {
  //     return;
  //   }
  //   setUpdateSuccess("");
  //   setUsersError("");
  //   try {
  //     const userRef = doc(db, "users", userId);
  //     await deleteDoc(userRef);
  //     setUpdateSuccess("User deleted successfully!");
  //   } catch (error) {
  //     setUsersError("Failed to delete user: " + error.message);
  //   }
  // };

  const handleDeleteAllMessages = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all messages in the system? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const messagesCollection = collection(db, "messages");
      const querySnapshot = await getDocs(messagesCollection);

      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      alert("All messages deleted successfully.");
    } catch (error) {
      console.error("Error deleting messages:", error);
      alert("Failed to delete messages. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (displayMode === "all") return true;
    return user.status === displayMode;
  });

  if (logoutLoading) {
    return (
      <div className="spinner-container">
        <p>Logging out...</p>
        <l-spiral size="40" speed="0.9" color="blue"></l-spiral>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/users")} style={styles.logoutButton}>
          👥
        </button>
        <button
          onClick={() => setShowUsersModal(true)}
          style={styles.logoutButton}
        >
          🛠️
        </button>
        <h1 style={styles.appName}>Admin Dashboard</h1>
        <button
          onClick={() => setShowQuizScoresModal(true)}
          style={styles.logoutButton}
        >
          📊
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          🔓
        </button>
      </div>

      <div style={styles.dashboardContainer}>
        <div style={styles.leftSection}>
          <div style={styles.analyticsSection}>
            <h2 style={styles.title}>User Analytics</h2>
            {analyticsLoading ? (
              <div style={styles.loading}>
                <i className="fa fa-spinner fa-spin" style={styles.spinner}></i>
                Loading analytics...
              </div>
            ) : analyticsError ? (
              <p style={styles.error}>{analyticsError}</p>
            ) : (
              <div style={styles.analyticsContent}>
                <p style={styles.analyticsText}>
                  Total Users: {analytics.totalUsers}
                </p>
                <p style={styles.analyticsText}>
                  Online Users: {analytics.onlineUsers}
                </p>
                <p style={styles.analyticsText}>
                  Offline Users: {analytics.offlineUsers}
                </p>
                <h3 style={styles.subTitle}>Program Distribution</h3>
                {Object.entries(analytics.programDistribution).map(
                  ([program, count]) => (
                    <p key={program} style={styles.distributionText}>
                      {program}: {count}
                    </p>
                  )
                )}
                <h3 style={styles.subTitle}>Level Distribution</h3>
                {Object.entries(analytics.levelDistribution).map(
                  ([level, count]) => (
                    <p key={level} style={styles.distributionText}>
                      {level}: {count}
                    </p>
                  )
                )}
              </div>
            )}
          </div>
          <div style={styles.chartSection}>
            <h2 style={styles.title}>Program Distribution Chart</h2>
            <div style={styles.chartContainer}>
              <Bar
                data={{
                  labels: abbreviatedLabels,
                  datasets: [
                    {
                      label: "Users by Program",
                      data: Object.values(analytics.programDistribution),
                      backgroundColor: "rgba(11, 235, 235, 0.6)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Number of Users",
                      },
                    },
                    x: {
                      title: {
                        display: true,
                        text: "Program of Study",
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div style={styles.leftSection}>
          <div style={styles.messageSection}>
            <h2 style={styles.title}>Send Message to All Users</h2>
            <textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={styles.textarea}
              rows="5"
            />
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            {loading ? (
              <div style={styles.loading}>
                <i className="fa fa-spinner fa-spin" style={styles.spinner}></i>
                Sending message...
              </div>
            ) : (
              <button
                onClick={handleSendMessage}
                style={styles.button}
                disabled={loading}
              >
                SEND MESSAGE
              </button>
            )}
          </div>
          <div style={styles.buttonRow}>
            <button
              onClick={() => navigate("/top-performers")}
              style={{ ...styles.logoutButton, width: "30%" }}
            >
              👑
            </button>
            <button
              onClick={() => navigate("/weekly-leaderboard")}
              style={{ ...styles.logoutButton, width: "30%" }}
            >
              🥇🥈🥉
            </button>
            <button
              onClick={handleDeleteAllMessages}
              style={{ ...styles.logoutButton, width: "30%" }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      {showQuizScoresModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Quiz Scores Overview</h2>
            {quizScoresLoading ? (
              <div style={modalStyles.loading}>
                <i
                  className="fa fa-spinner fa-spin"
                  style={modalStyles.spinner}
                ></i>
                Loading quiz scores...
              </div>
            ) : quizScoresError ? (
              <p style={modalStyles.error}>{quizScoresError}</p>
            ) : (
              <div>
                <div
                  style={{ marginBottom: "20px", display: "flex", gap: "15px" }}
                >
                  <div>
                    <label
                      htmlFor="programFilter"
                      style={{ marginRight: "10px", fontWeight: "bold" }}
                    >
                      Program of Study:
                    </label>
                    <select
                      id="programFilter"
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      style={{
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="">All Programs</option>
                      {[
                        ...new Set(
                          quizScoresSummary.topPerformersByProgram.map(
                            (item) => item.program
                          )
                        ),
                      ]
                        .sort()
                        .map((program, index) => (
                          <option key={index} value={program}>
                            {program}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="levelFilter"
                      style={{ marginRight: "10px", fontWeight: "bold" }}
                    >
                      Level of Study:
                    </label>
                    <select
                      id="levelFilter"
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      style={{
                        padding: "5px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="">All Levels</option>
                      {[
                        ...new Set(
                          quizScoresSummary.topPerformersByProgram.flatMap(
                            (item) => item.levels.map((level) => level.level)
                          )
                        ),
                      ]
                        .sort()
                        .map((level, index) => (
                          <option key={index} value={level}>
                            {level}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {/* <p>
                  <strong>Overall Average Score (Filtered):</strong>{" "}
                  {(() => {
                    const filteredScores =
                      quizScoresSummary.topPerformersByProgram
                        .filter(
                          (item) =>
                            !selectedProgram || item.program === selectedProgram
                        )
                        .flatMap((item) => item.levels)
                        .filter(
                          (level) =>
                            !selectedLevel || level.level === selectedLevel
                        )
                        .flatMap((level) => level.subjects)
                        .flatMap((subject) => subject.topPerformers);

                    const totalScore = filteredScores.reduce(
                      (sum, performer) => sum + performer.score,
                      0
                    );
                    const totalQuizzes = filteredScores.length;
                    return totalQuizzes > 0
                      ? (totalScore / totalQuizzes).toFixed(1)
                      : "0.0";
                  })()}
                </p> */}

                <div style={modalStyles.content1}>
                  <h3 style={modalStyles.head}>
                    Top Performers by Program and Level of Study
                  </h3>
                  {(() => {
                    const filteredPrograms =
                      quizScoresSummary.topPerformersByProgram.filter(
                        (item) =>
                          !selectedProgram || item.program === selectedProgram
                      );

                    const hasData = filteredPrograms.some((program) =>
                      program.levels.some((level) =>
                        level.subjects.some(
                          (subject) => subject.topPerformers.length > 0
                        )
                      )
                    );

                    if (!hasData) {
                      return (
                        <p
                          style={{
                            color: "#ff0000",
                            fontStyle: "italic",
                            textAlign: "center",
                          }}
                        >
                          No data available for the selected filters.
                        </p>
                      );
                    }

                    return filteredPrograms.map(
                      ({ program, levels }, programIndex) => (
                        <div
                          key={programIndex}
                          style={{ marginBottom: "30px" }}
                        >
                          <h4
                            style={{ fontSize: "1.5em", marginBottom: "10px" }}
                          >
                            {program}
                          </h4>
                          {levels
                            .filter(
                              (level) =>
                                !selectedLevel || level.level === selectedLevel
                            )
                            .map(({ level, subjects }, levelIndex) => (
                              <div
                                key={levelIndex}
                                style={{
                                  marginBottom: "20px",
                                  marginLeft: "20px",
                                }}
                              >
                                <h5
                                  style={{
                                    fontSize: "1.3em",
                                    marginBottom: "10px",
                                  }}
                                >
                                  {level}
                                </h5>
                                {subjects.map(
                                  (
                                    { subject, topPerformers },
                                    subjectIndex
                                  ) => (
                                    <div
                                      key={subjectIndex}
                                      style={{
                                        marginBottom: "15px",
                                        marginLeft: "20px",
                                      }}
                                    >
                                      <h6
                                        style={{
                                          fontSize: "1.1em",
                                          marginBottom: "5px",
                                        }}
                                      >
                                        {subject}
                                      </h6>
                                      <table style={tableStyles.table}>
                                        <thead>
                                          <tr>
                                            <th style={tableStyles.th}>
                                              Username
                                            </th>
                                            <th style={tableStyles.th}>
                                              Score
                                            </th>
                                            <th style={tableStyles.th}>
                                              Total Questions
                                            </th>
                                            <th style={tableStyles.th}>
                                              Score (%)
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {topPerformers.length > 0 ? (
                                            topPerformers.map(
                                              (performer, i) => (
                                                <tr
                                                  key={i}
                                                  style={tableStyles.tr}
                                                >
                                                  <td style={tableStyles.td}>
                                                    {performer.username}
                                                  </td>
                                                  <td style={tableStyles.td}>
                                                    {performer.score}
                                                  </td>
                                                  <td style={tableStyles.td}>
                                                    {performer.totalQuestions}
                                                  </td>
                                                  <td style={tableStyles.td}>
                                                    {performer.percentage}
                                                  </td>
                                                </tr>
                                              )
                                            )
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan="4"
                                                style={tableStyles.noDataTd}
                                              >
                                                No top performers for this
                                                subject.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  )
                                )}
                              </div>
                            ))}
                        </div>
                      )
                    );
                  })()}
                </div>
              </div>
            )}
            <button
              onClick={() => setShowQuizScoresModal(false)}
              style={modalStyles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showUsersModal && (
        <div style={modalStyles1.overlay}>
          <div style={modalStyles1.modal}>
            <h2 style={modalStyles1.title}>Manage Users</h2>
            <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => setDisplayMode("all")}
                style={{
                  ...styles.button,
                  padding: "5px 15px",
                  backgroundColor: displayMode === "all" ? "#4CAF50" : "#ccc",
                }}
              >
                All Users
              </button>
              <button
                onClick={() => setDisplayMode("online")}
                style={{
                  ...styles.button,
                  padding: "5px 15px",
                  backgroundColor:
                    displayMode === "online" ? "#4CAF50" : "#ccc",
                }}
              >
                Online Users
              </button>
              <button
                onClick={() => setDisplayMode("offline")}
                style={{
                  ...styles.button,
                  padding: "5px 15px",
                  backgroundColor:
                    displayMode === "offline" ? "#4CAF50" : "#ccc",
                }}
              >
                Offline Users
              </button>
            </div>
            {usersLoading ? (
              <div style={modalStyles1.loading}>
                <i
                  className="fa fa-spinner fa-spin"
                  style={modalStyles1.spinner}
                ></i>
                Loading users...
              </div>
            ) : usersError ? (
              <p style={modalStyles1.error}>{usersError}</p>
            ) : (
              <div style={modalStyles1.content}>
                <table style={tableStyles.table}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Username
                      </th>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Level of Study
                      </th>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Program of Study
                      </th>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Role
                      </th>
                      {/* <th style={tableStyles.th}>Actions</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={tableStyles.tr}>
                        <td style={tableStyles.td}>{user.username}</td>
                        <td style={tableStyles.td}>{user.levelOfStudy}</td>
                        <td style={tableStyles.td}>{user.programOfStudy}</td>
                        <td style={tableStyles.td}>
                          {/* {user.status} */}
                          <button
                            onClick={() =>
                              handleToggleStatus(user.id, user.status)
                            }
                            style={{
                              ...styles.button,
                              padding: "5px 10px",
                              marginLeft: "10px",
                              backgroundColor:
                                user.status === "online"
                                  ? "#f44336"
                                  : "#4CAF50",
                            }}
                          >
                            {user.status === "online"
                              ? "Set Offline"
                              : "Set Online"}
                          </button>
                        </td>
                        <td style={tableStyles.td}>
                          {/* {user.role} */}
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            style={{
                              ...styles.button,
                              padding: "5px 10px",
                              marginLeft: "10px",
                              backgroundColor:
                                user.role === "admin" ? "#f44336" : "#4CAF50",
                            }}
                          >
                            {user.role === "admin"
                              ? "Remove Admin"
                              : "Set Admin"}
                          </button>
                        </td>
                        {/* <td style={tableStyles.td}>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            style={{
                              ...styles.button,
                              padding: "5px 10px",
                              backgroundColor: "#f44336",
                            }}
                          >
                            Delete
                          </button>
                        </td> */}
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" style={tableStyles.noDataTd}>
                          No{" "}
                          {displayMode === "all"
                            ? "users"
                            : `${displayMode} users`}{" "}
                          found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {updateSuccess && <p style={styles.success}>{updateSuccess}</p>}
              </div>
            )}
            <button
              onClick={() => setShowUsersModal(false)}
              style={modalStyles1.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    padding: "0 20px",
    fontFamily: "Poppins, sans-serif",
  },
  header: {
    position: "absolute",
    top: "20px",
    width: "95%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 30px",
    zIndex: 10,
    boxShadow: "0 8px 10px rgba(0,0,0,0.8)",
    borderRadius: "10px",
  },
  appName: {
    fontSize: "40px",
    fontWeight: "700",
    color: "black",
    textTransform: "uppercase",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    padding: "10px",
    borderRadius: "20px",
  },
  logoutButton: {
    padding: "20px",
    backgroundColor: "transparent",
    color: "white",
    border: "none",
    borderRadius: "50px",
    fontSize: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
  },
  dashboardContainer: {
    borderRadius: "8px",
    padding: "25px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.7)",
    width: "98%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    height: "70vh",
    marginTop: "120px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: "20px",
  },
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  analyticsSection: {
    flex: 1,
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    maxHeight: "40%",
    textAlign: "center",
  },
  analyticsContent: {
    maxHeight: "75%",
    overflowY: "auto",
  },
  chartSection: {
    flex: 1,
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
  },
  chartContainer: {
    height: "220px",
  },
  messageSection: {
    flex: 1,
    padding: "15px",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    marginBottom: "15px",
    fontSize: "24px",
    fontWeight: "600",
    color: "#333",
    textTransform: "uppercase",
  },
  subTitle: {
    marginTop: "10px",
    marginBottom: "8px",
    fontSize: "18px",
    fontWeight: "500",
    color: "#555",
    textTransform: "uppercase",
  },
  analyticsText: {
    fontSize: "20px",
    margin: "5px 0",
    color: "#333",
    textAlign: "left",
  },
  distributionText: {
    fontSize: "18px",
    margin: "3px 0",
    color: "#444",
    textAlign: "left",
  },
  textarea: {
    height: "75%",
    width: "95%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    marginBottom: "15px",
    resize: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
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
  loading: {
    textAlign: "center",
    fontSize: "14px",
    color: "#4CAF50",
    marginTop: "15px",
  },
  spinner: {
    fontSize: "20px",
    marginRight: "8px",
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
    width: "80%",
    maxHeight: "80vh",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "30px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center",
    textTransform: "uppercase",
    boxShadow: "0 4px 8px rgba(0,0,0,0.6)",
    width: "80%",
    borderRadius: "10px",
    padding: "10px",
    margin: "30px auto",
  },
  head: {
    textAlign: "center",
    fontSize: "25px",
  },
  content1: {
    marginBottom: "10px",
    overflowY: "auto",
    maxHeight: "480px",
  },
  closeButton: {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    textTransform: "uppercase",
    width: "100%",
  },
  loading: {
    textAlign: "center",
    fontSize: "20px",
    margin: "20px",
  },
  spinner: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
};
const tableStyles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "15px",
    backgroundColor: "#fff",
  },
  th: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    borderBottom: "2px solid #ddd",
  },
  tr: {
    borderBottom: "1px solid #ddd",
  },
  td: {
    padding: "8px 10px",
    textAlign: "center",
  },
  noDataTd: {
    padding: "10px",
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
};
const modalStyles1 = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  content: {
    marginBottom: "5px",
    overflowY: "auto",
    maxHeight: "550px",
  },
  closeButton: {
    padding: "10px 20px",
    fontSize: "14px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    width: "100%",
  },
  loading: {
    textAlign: "center",
    fontSize: "14px",
    color: "#4CAF50",
    marginBottom: "15px",
  },
  spinner: {
    fontSize: "20px",
    marginRight: "8px",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginBottom: "15px",
  },
  noData: {
    color: "#666",
    fontStyle: "italic",
  },
};
export default AdminDashboard;
