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
  Timestamp,
} from "firebase/firestore";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import emailjs from "@emailjs/browser";
import { Bar } from "react-chartjs-2";
import { formatDistanceToNow, format } from "date-fns";
import { FaPaperPlane } from "react-icons/fa";
import { dotWave } from "ldrs";

const AdminDashboard = () => {
  const [message, setMessage] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
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
  const [password, setPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOption, setDeleteOption] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showManageAdminsModal, setShowManageAdminsModal] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [errorAdmins, setErrorAdmins] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [deleteMessageSuccess, setDeleteMessageSuccess] = useState("");
  const [deleteMessageError, setDeleteMessageError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const correctPassword = "Admin123";

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
    let unsubscribeAuth;
    setAuthLoading(true);

    unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists() || userDoc.data().role !== "admin") {
            setError("Unauthorized access. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
          }
        } catch (error) {
          console.error("Error verifying admin:", error);
          setError("Failed to verify admin status. Redirecting to login...");
          setTimeout(() => navigate("/login"), 2000);
        }
      } else {
        setError("No user is logged in. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth && unsubscribeAuth();
  }, [authInstance, navigate]);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoadingAdmins(true);
      setErrorAdmins(null);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const admins = usersSnapshot.docs
          .filter((doc) => doc.data().role === "admin")
          .map((doc) => ({
            id: doc.id,
            username: doc.data().username || "Unknown",
            status: doc.data().status || "Unknown",
          }));
        setAdminUsers(admins);
      } catch (error) {
        setErrorAdmins("Failed to load admin users: " + error.message);
      } finally {
        setLoadingAdmins(false);
      }
    };

    if (showManageAdminsModal) {
      fetchAdmins();
    }
  }, [showManageAdminsModal]);

  const handleRemoveAdmin = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: "user" });
      setAdminUsers(adminUsers.filter((user) => user.id !== userId));
      alert(`Admin rights removed from user`);
    } catch (error) {
      setErrorAdmins("Failed to remove admin: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, [authInstance]);

  useEffect(() => {
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
                lastActivity: doc.data().lastActivity || null,
                phoneNumber: doc.data().userNumber || "",
              }))
              .filter((user) => user.role !== "admin");
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

  useEffect(() => {
    const fetchMessages = () => {
      setMessagesLoading(true);
      setMessagesError("");
      try {
        const messagesRef = collection(db, "messages");
        const unsubscribe = onSnapshot(
          messagesRef,
          (snapshot) => {
            const messagesList = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                content: data.message,
                recipients: data.userId ? [data.userId] : [],
                sentAt: data.timestamp?.toDate() || new Date(),
                readBy: data.read && data.userId ? [data.userId] : [],
                sender: data.sender || "admin",
                isGroup: data.isGroup || false,
              };
            });
            setMessages(messagesList);
            setMessagesLoading(false);
          },
          (err) => {
            setMessagesError("Failed to load messages: " + err.message);
            setMessagesLoading(false);
          }
        );
        return () => unsubscribe();
      } catch (error) {
        setMessagesError("Failed to initialize messages: " + error.message);
        setMessagesLoading(false);
      }
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    setDeleteMessageSuccess("");
    setDeleteMessageError("");

    try {
      const messageDocRef = doc(db, "messages", messageId);
      await deleteDoc(messageDocRef);
      setDeleteMessageSuccess("Message deleted successfully!");
    } catch (error) {
      console.error("Error deleting message:", error);
      setDeleteMessageError("Failed to delete message: " + error.message);
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

  // const handleToggleStatus = async (userId, currentStatus) => {
  //   setUpdateSuccess("");
  //   try {
  //     const userRef = doc(db, "users", userId);
  //     await updateDoc(userRef, {
  //       status: currentStatus === "online" ? "offline" : "online",
  //       lastActivity: Timestamp.fromDate(new Date()),
  //     });
  //     setUpdateSuccess("User status updated successfully!");
  //   } catch (error) {
  //     setUsersError("Failed to update user status: " + error.message);
  //   }
  // };

  const deleteQuizScores = async (challengeDocId) => {
    const quizScoresRef = collection(
      db,
      "challenges",
      challengeDocId,
      "scores"
    );
    const quizScoresSnapshot = await getDocs(quizScoresRef);
    quizScoresSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };

  const deleteChallenges = async () => {
    const challengesRef = collection(db, "challenges");
    const challengesSnapshot = await getDocs(challengesRef);
    challengesSnapshot.forEach(async (doc) => {
      await deleteQuizScores(doc.id);
      await deleteDoc(doc.ref);
    });
  };

  const deleteReplies = async (complaintId) => {
    const repliesRef = collection(db, "complaints", complaintId, "replies");
    const repliesSnapshot = await getDocs(repliesRef);
    const deletePromises = repliesSnapshot.docs.map((replyDoc) =>
      deleteDoc(replyDoc.ref)
    );
    await Promise.all(deletePromises);
  };

  const deleteComplaints = async () => {
    const complaintsRef = collection(db, "complaints");
    const complaintsSnapshot = await getDocs(complaintsRef);

    for (const complaintDoc of complaintsSnapshot.docs) {
      await deleteReplies(complaintDoc.id);
      await deleteDoc(doc(db, "complaints", complaintDoc.id));
    }
  };

  const handleDeleteAction = async () => {
    if (password !== correctPassword) {
      setPasswordError("Incorrect password. Please try again.");
      return;
    }
    setDeleteLoading(true);
    try {
      if (deleteOption === "messages") {
        const messagesCollection = collection(db, "messages");
        const querySnapshot = await getDocs(messagesCollection);
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        alert("All messages deleted successfully.");
      } else if (deleteOption === "dailyQuizzes") {
        const dailyQuizzesCollection = collection(db, "dailyQuizzes");
        const querySnapshot = await getDocs(dailyQuizzesCollection);
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        alert("All Daily Quizzes deleted successfully.");
      } else if (deleteOption === "text") {
        const textCollection = collection(db, "text");
        const querySnapshot = await getDocs(textCollection);
        const deletePromises = querySnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        alert("All Text Data deleted successfully.");
      } else if (deleteOption === "challenges") {
        await deleteChallenges();
        alert("All challenges and their scores deleted successfully.");
      } else if (deleteOption === "complaints") {
        await deleteComplaints();
        alert("All complaints and their replies deleted successfully.");
      }

      setPassword("");
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setDeleteOption("");
    } catch (error) {
      console.error(`Error deleting ${deleteOption}:`, error);
      alert(`Failed to delete ${deleteOption}. Please try again.`);
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

  dotWave.register();

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
            <h2 style={styles.title}>Send Message to All Users Via Email</h2>
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
                <FaPaperPlane />
              </button>
            )}
          </div>
          <div style={styles.buttonRow}>
            <button
              onClick={() => navigate("/top-performers")}
              style={{ ...styles.logoutButton, width: "20%" }}
            >
              👑
            </button>
            <button
              onClick={() => setShowModal(true)}
              style={{ ...styles.logoutButton, width: "20%" }}
            >
              🛎️
            </button>
            <button
              onClick={() => navigate("/weekly-leaderboard")}
              style={{ ...styles.logoutButton, width: "20%" }}
            >
              🥇🥈🥉
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ ...styles.logoutButton, width: "20%" }}
            >
              🗑️
            </button>
            <button
              onClick={() => setShowManageAdminsModal(true)}
              style={{ ...styles.logoutButton, width: "20%" }}
            >
              🧑‍💻
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Delete Data</h2>
            <div style={{ marginBottom: "100px" }}>
              <label style={{ marginRight: "10px", fontWeight: "bold" }}>
                Select what to delete:
              </label>
              <select
                value={deleteOption}
                onChange={(e) => setDeleteOption(e.target.value)}
                style={{
                  padding: "5px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  width: "800px",
                }}
              >
                <option value="">-- Select Option --</option>
                <option value="messages">All Messages</option>
                <option value="challenges">All Challenges</option>
                <option value="dailyQuizzes">All Leaderboard Data</option>
                <option value="text">All Text Data</option>
                <option value="complaints">All Complaints Data</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter Password to Confirm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={styles.toggleButton}
              >
                <i
                  className={`fa ${
                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                  }`}
                ></i>
              </button>
              {passwordError && <p style={styles.errorText}>{passwordError}</p>}
            </div>
            <div style={styles.buttonContainer}>
              <button
                onClick={handleDeleteAction}
                style={styles.confirmButton}
                disabled={!deleteOption}
              >
                {deleteLoading ? (
                  <>
                    Deleting{" "}
                    <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                  </>
                ) : (
                  "Confirm Delete"
                )}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteOption("");
                  setPassword("");
                  setPasswordError("");
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                                              Percentage Pass (%)
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
                        Last Seen
                      </th>
                      <th
                        style={{
                          ...tableStyles.th,
                          position: "sticky",
                          top: "0",
                        }}
                      >
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} style={tableStyles.tr}>
                        <td style={tableStyles.td}>{user.username}</td>
                        <td style={tableStyles.td}>{user.levelOfStudy}</td>
                        <td style={tableStyles.td}>{user.programOfStudy}</td>
                        <td style={tableStyles.td}>
                          {/* <button
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
                          </button> */}
                          <span
                            style={{
                              ...styles.button,
                              padding: "5px 10px",
                              backgroundColor:
                                user.status === "online"
                                  ? "#4CAF50"
                                  : "#f44336",
                            }}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td style={tableStyles.td}>
                          {user.status === "online"
                            ? "Online"
                            : user.lastActivity
                            ? `Last seen ${formatDistanceToNow(
                                user.lastActivity.toDate(),
                                { addSuffix: true }
                              )}`
                            : "Never"}
                        </td>
                        <td style={tableStyles.td}>
                          {user.lastActivity
                            ? format(
                                user.lastActivity.toDate(),
                                "MMMM d, yyyy, h:mm a"
                              )
                            : "Never"}
                        </td>
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

      {showMessagesModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h2 style={modalStyles.title}>Sent Messages</h2>
            {messagesLoading ? (
              <div style={modalStyles.loading}>
                <i
                  className="fa fa-spinner fa-spin"
                  style={modalStyles.spinner}
                ></i>
                Loading messages...
              </div>
            ) : messagesError ? (
              <p style={modalStyles.error}>{messagesError}</p>
            ) : (
              <div style={modalStyles.content1}>
                <table style={tableStyles.table}>
                  <thead>
                    <tr>
                      <th style={tableStyles.th}>Message</th>
                      <th style={tableStyles.th}>Sent To</th>
                      <th style={tableStyles.th}>Sent At</th>
                      <th style={tableStyles.th}>Read By</th>
                      <th style={tableStyles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length > 0 ? (
                      messages.map((msg) => {
                        const recipients = msg.recipients;
                        const recipientNames = msg.isGroup
                          ? "All Users"
                          : users
                              .filter((user) => recipients.includes(user.id))
                              .map((user) => user.username)
                              .join(", ") || "Unknown Users";
                        const readByNames = msg.readBy
                          ? users
                              .filter((user) => msg.readBy.includes(user.id))
                              .map((user) => user.username)
                              .join(", ") || "None"
                          : "None";
                        const isRead = msg.readBy && msg.readBy.length > 0;

                        return (
                          <tr key={msg.id} style={tableStyles.tr}>
                            <td
                              style={{
                                ...tableStyles.td,
                                textAlign: "justify",
                                width: "400px",
                              }}
                            >
                              {msg.content}
                            </td>
                            <td style={tableStyles.td}>{recipientNames}</td>
                            <td style={tableStyles.td}>
                              {formatDistanceToNow(msg.sentAt, {
                                addSuffix: true,
                              })}
                            </td>
                            <td style={tableStyles.td}>
                              <span style={{ color: isRead ? "green" : "red" }}>
                                {readByNames} {isRead ? "(Read)" : "(Unread)"}
                              </span>
                            </td>
                            <td style={tableStyles.td}>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                style={{
                                  backgroundColor: "white",
                                  border: "2px solid #ddd",
                                  borderRadius: "30px",
                                  padding: "8px",
                                  fontSize: "15px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "background-color 0.3s",
                                }}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" style={tableStyles.noDataTd}>
                          No messages found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => setShowMessagesModal(false)}
              style={modalStyles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "70%",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "10px" }}>Open:</h3>
            <button
              onClick={() => {
                navigate("/admin-complaint");
                setShowModal(false);
              }}
              style={{
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                fontWeight: "bolder",
                cursor: "pointer",
                fontSize: "28px",
              }}
            >
              📩 Complaints
            </button>
            <button
              onClick={() => {
                setShowMessagesModal(true);
                setShowModal(false);
              }}
              style={{
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                fontWeight: "bolder",
                cursor: "pointer",
                fontSize: "28px",
              }}
            >
              💬 Messages
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: "8px",
                borderRadius: "5px",
                backgroundColor: "#ccc",
                color: "#000",
                border: "none",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "20px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showManageAdminsModal && (
        <div style={manageAdminsModalStyles.overlay}>
          <div style={manageAdminsModalStyles.modal}>
            <h2 style={manageAdminsModalStyles.title}>Manage Admin Users</h2>
            {loadingAdmins ? (
              <div style={manageAdminsModalStyles.loading}>
                <i
                  className="fa fa-spinner fa-spin"
                  style={manageAdminsModalStyles.spinner}
                ></i>
                Loading admin users...
              </div>
            ) : errorAdmins ? (
              <p style={manageAdminsModalStyles.error}>{errorAdmins}</p>
            ) : (
              <div style={manageAdminsModalStyles.content}>
                {adminUsers.length === 0 ? (
                  <p style={manageAdminsModalStyles.noDataMessage}>
                    No admin users found.
                  </p>
                ) : (
                  <ul style={manageAdminsModalStyles.userList}>
                    {adminUsers.map((user) => (
                      <li
                        key={user.id}
                        style={manageAdminsModalStyles.userItem}
                      >
                        <span style={manageAdminsModalStyles.userName}>
                          {user.username}
                        </span>
                        <span style={manageAdminsModalStyles.userName}>
                          {user.status}
                        </span>
                        <button
                          onClick={() => handleRemoveAdmin(user.id)}
                          style={manageAdminsModalStyles.removeButton}
                          disabled={user.id === auth.currentUser.uid}
                        >
                          Remove Admin
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <button
              onClick={() => setShowManageAdminsModal(false)}
              style={manageAdminsModalStyles.closeButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div style={styles.scrollingContainer}>
        <div style={styles.scrollingText}>
          🌟 Behind every smooth user experience is an admin making things
          happen. Your attention to detail, your problem-solving, and your
          dedication keep Prime Academy running strong. 🌟 🌟 Every ticket
          resolved, every report reviewed, every system checked — it all
          matters. You're not just managing data; you're enabling dreams. 🌟 🌟
          Leadership isn't always visible, but its effects are powerful. You're
          building the foundation others grow from. 🌟 🌟 Prime Academy’s
          progress is powered by people like you. Keep optimizing, keep
          improving — your impact is immeasurable. 🌟 🌟 Remember: every system
          you maintain is a student’s smooth path to success. Your excellence
          behind the scenes shapes the future. 🌟 🌟 Great systems. Happy users.
          Strong academy. That’s your influence at work. 🌟      🌟 Behind every
          smooth user experience is an admin making things happen. Your
          attention to detail, your problem-solving, and your dedication keep
          Prime Academy running strong. 🌟 🌟 Every ticket resolved, every
          report reviewed, every system checked — it all matters. You're not
          just managing data; you're enabling dreams. 🌟 🌟 Leadership isn't
          always visible, but its effects are powerful. You're building the
          foundation others grow from. 🌟 🌟 Prime Academy’s progress is powered
          by people like you. Keep optimizing, keep improving — your impact is
          immeasurable. 🌟 🌟 Remember: every system you maintain is a student’s
          smooth path to success. Your excellence behind the scenes shapes the
          future. 🌟 🌟 Great systems. Happy users. Strong academy. That’s your
          influence at work. 🌟
        </div>
      </div>
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
    position: "fixed",
    width: "97.5%",
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
    height: "68vh",
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
    textAlign: "center",
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
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "background-color 0.3s",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
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
  passwordInput: {
    padding: "10px",
    fontSize: "20px",
    width: "90%",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "2px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s",
  },
  toggleButton: {
    position: "absolute",
    right: "50px",
    top: "42%",
    transform: "translateY(-50%)",
    background: "none",
    border: "2px solid #ddd",
    borderRadius: "40px",
    cursor: "pointer",
    color: "#999",
    fontSize: "20px",
    padding: "8px",
  },
  confirmButton: {
    backgroundColor: "green",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    width: "45%",
    fontSize: "20px",
    textTransform: "uppercase",
    fontWeight: "bolder",
  },
  cancelButton: {
    backgroundColor: "red",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginLeft: "10px",
    width: "45%",
    fontSize: "20px",
    textTransform: "uppercase",
    fontWeight: "bolder",
  },
  errorText: {
    color: "red",
    fontSize: "14px",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "70px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    boxShadow: "0 4px 4px rgba(0,0,0,0.6)",
    padding: "10px",
    borderRadius: "10px",
  },
  scrollingContainer: {
    position: "fixed",
    bottom: 0,
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
    animation: "scrollText 120s linear infinite",
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
    marginBottom: "10px",
    overflowY: "auto",
    maxHeight: "530px",
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
const manageAdminsModalStyles = {
  overlay: {
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
    borderRadius: "5px",
    width: "750px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "24px",
    marginBottom: "15px",
    color: "#333",
    textAlign: "center",
  },
  content: {
    marginBottom: "20px",
  },
  loading: {
    textAlign: "center",
    color: "#007bff",
    fontSize: "16px",
  },
  spinner: {
    fontSize: "24px",
    marginRight: "10px",
  },
  error: {
    color: "#dc3545",
    textAlign: "center",
    fontSize: "16px",
  },
  noDataMessage: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    fontSize: "16px",
  },
  userList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  userItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    borderBottom: "1px solid #eee",
  },
  userName: {
    fontSize: "20px",
    color: "#333",
  },
  removeButton: {
    padding: "5px 10px",
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s",
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    width: "100%",
    fontSize: "16px",
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
export default AdminDashboard;
