import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import logo from "../assets/op.jpg";
import logo1 from "../assets/original.png";
import useInactivityLogout from "./useInactivityLogout";
import StreakTracker from "./StreakTracker";
import { dotStream, spiral } from "ldrs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [textUnreadCount, setTextUnreadCount] = useState(0);
  const [hasTakenDailyQuiz, setHasTakenDailyQuiz] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [latestMessage, setLatestMessage] = useState(null);
  const [userRole, setUserRole] = useState("user");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const quotes = [
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "The best way to predict the future is to create it.",
      author: "Abraham Lincoln",
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
    },
    {
      text: "Success is the sum of small efforts, repeated day in and day out.",
      author: "Robert Collier",
    },
    { text: "Don’t wait for opportunity. Create it.", author: "Anonymous" },
    {
      text: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
    },
    {
      text: "An investment in knowledge pays the best interest.",
      author: "Benjamin Franklin",
    },
    {
      text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
      author: "Dr. Seuss",
    },
    {
      text: "Education is the key to unlocking the world, a passport to freedom.",
      author: "Oprah Winfrey",
    },
    {
      text: "Learning never exhausts the mind, it only ignites it.",
      author: "Leonardo da Vinci",
    },
    {
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      author: "Franklin D. Roosevelt",
    },
    {
      text: "The beautiful thing about learning is that no one can take it away from you.",
      author: "B.B. King",
    },
    {
      text: "Education is not preparation for life; education is life itself.",
      author: "John Dewey",
    },
    {
      text: "What we learn with pleasure we never forget.",
      author: "Alfred Mercier",
    },
    {
      text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
      author: "Aristotle",
    },
  ];

  const studyTips = [
    "Consistency is key to mastering new skills. Small daily efforts lead to big progress over time.",
    "Never be afraid to ask for help. Collaborating with others can open up new ways of learning.",
    "Stay organized! Keeping track of your tasks and goals can reduce stress and increase productivity.",
    "Don’t be afraid of failure – it’s a stepping stone to success. Learn from mistakes and keep improving.",
    "Make learning fun! Try gamifying your study sessions to make them more enjoyable and engaging.",
    "Active learning is the best way to retain information. Summarize what you've learned, teach others, and practice recalling key concepts.",
    "Break your study time into manageable chunks using the Pomodoro Technique. 25-minute intervals of focus followed by 5-minute breaks can improve productivity.",
    "Spaced repetition is a game changer. Review material at increasing intervals to combat forgetting and solidify long-term memory.",
    "Set specific goals for each study session. Instead of vague intentions, make each task measurable and achievable to stay on track.",
    "Visual aids like mind maps and diagrams can simplify complex ideas and help you understand relationships between concepts.",
    "Avoid multitasking. Focus on one thing at a time for better concentration and deeper learning.",
    "Practice retrieval by testing yourself regularly. This strengthens memory and helps you actively engage with the material.",
    "Study in short, frequent sessions rather than cramming. Consistent, smaller study periods improve retention and prevent burnout.",
    "Teach others or engage in group discussions to reinforce your understanding and learn from different perspectives.",
    "Prioritize sleep, exercise, and nutrition. A healthy body supports a sharp mind, which is crucial for effective learning.",
    "Use technology and apps to enhance your learning experience. Tools like Anki, Notion, and Quizlet help keep you organized and focused.",
    "Work through past papers or sample problems to familiarize yourself with the material and exam format.",
    "Break down large tasks into smaller steps. This prevents overwhelm and makes progress feel more achievable.",
    "Stay organized by tracking assignments and setting deadlines. A cluttered space or mind leads to increased stress.",
    "Change your study environment from time to time. A new setting can refresh your focus and spark creativity.",
    "Be patient and consistent. Learning is a process, and steady effort over time leads to mastery.",
    "Make learning enjoyable by connecting the material to your interests. Try to find fun ways to engage with the content.",
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const floatingQuizButtonStyle = {
    position: "fixed",
    bottom: "60px",
    right: isHovered ? "-25px" : "-65px",
    backgroundColor: "#FFD700",
    color: "#fff",
    border: "2px solid black",
    borderRadius: "30px",
    width: "90px",
    height: "60px",
    fontSize: "24px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
    cursor: "pointer",
    zIndex: 1500,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "right 0.6s ease",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  };

  const modalButtonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#0EA5E9",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const menuButtonStyle = {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    zIndex: 1050,
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1000,
  };

  const sideMenuStyle = {
    position: "fixed",
    top: "10px",
    left: isMenuOpen ? "0" : "-300px",
    width: "250px",
    height: "80%",
    backgroundColor: "transparent",
    boxShadow: "2px 0 5px rgba(999,999,999,0.8)",
    borderRadius: "15px",
    transition: "left 0.9s ease-in-out",
    zIndex: 1100,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  const sideMenuButtonStyle = {
    padding: "10px",
    fontSize: "1.2rem",
    backgroundColor: "#0EA5E9",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "800",
  };

  const closeMenuButtonStyle = {
    alignSelf: "flex-end",
    background: "none",
    border: "none",
    fontSize: "1.4rem",
    cursor: "pointer",
    color: "red",
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const textQuery = query(
      collection(db, "text"),
      where("userIds", "array-contains", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(textQuery, (querySnapshot) => {
      let unread = 0;
      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        const messages = conversation.messages || [];
        messages.forEach((message) => {
          if (
            message.senderId !== auth.currentUser.uid &&
            message.read === false
          ) {
            unread++;
          }
        });
      });
      setTextUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  useEffect(() => {
    let unsubscribeMessages = () => {};
    let unsubscribeChallenges = () => {};
    let unsubscribeStatus = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username);
          setUserRole(userData.role || "user");
          setUserDetails({
            levelOfStudy: userData.levelOfStudy,
            programOfStudy: userData.programOfStudy,
            semesterOfStudy: userData.semesterOfStudy,
          });
          const messagesQuery = query(
            collection(db, "messages"),
            where("userId", "==", user.uid)
          );
          unsubscribeMessages = onSnapshot(messagesQuery, (querySnapshot) => {
            const userMessages = querySnapshot.docs.map((doc) => doc.data());
            const unread = userMessages.filter(
              (message) => !message.read
            ).length;
            setUnreadCount(unread);
            querySnapshot.docChanges().forEach((change) => {
              if (change.type === "added") {
                const message = change.doc.data();
                if (!message.read) {
                  setLatestMessage(message);
                  setShowMessageModal(true);
                }
              }
            });
          });

          const challengesQuery = query(
            collection(db, "challenges"),
            where("receiverId", "==", user.uid),
            where("status", "==", "pending")
          );
          unsubscribeChallenges = onSnapshot(challengesQuery, (snapshot) => {
            if (!snapshot.empty) {
              setShowChallengeModal(true);
            }
          });
          setLoading(false);
          // const today = new Date();
          // today.setHours(0, 0, 0, 0);
          // const quizQuery = query(
          //   collection(db, "dailyQuizzes"),
          //   where("userId", "==", user.uid),
          //   where("programOfStudy", "==", userData.programOfStudy),
          //   where("levelOfStudy", "==", userData.levelOfStudy),
          //   where("semesterOfStudy", "==", userData.semesterOfStudy),
          //   where("timestamp", ">=", Timestamp.fromDate(today))
          // );
          // const quizSnapshot = await getDocs(quizQuery);
          // const hasTakenToday = !quizSnapshot.empty;
          // setHasTakenDailyQuiz(hasTakenToday);
          // setShowModal(!hasTakenToday);
        } else {
          await setDoc(userDocRef, {
            username: user.displayName || "User",
            role: "user",
            status: "online",
          });
          setUsername(user.displayName || "User");
          setUserRole("user");
          setShowModal(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setShowModal(true);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
      unsubscribeChallenges();
      unsubscribeStatus();
    };
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  dotStream.register();
  spiral.register();

  useInactivityLogout(auth, db, currentUser, navigate, setLogoutLoading);

  const handleTakeChallenge = () => {
    setShowRulesModal(true);
  };

  const handleAcceptRules = () => {
    setShowRulesModal(false);
    navigate("/daily-challenge", {
      state: {
        levelOfStudy: userDetails.levelOfStudy,
        programOfStudy: userDetails.programOfStudy,
        semesterOfStudy: userDetails.semesterOfStudy,
      },
    });
  };

  const handleDeclineRules = () => {
    setShowRulesModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        status: "offline",
        lastActivity: Timestamp.fromDate(new Date()),
      });
      await signOut(auth);
      navigate("/login");
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <p style={{ fontSize: "36px", color: "blue" }}>
          Loading{" "}
          <l-dot-stream size="60" speed="2.5" color="blue"></l-dot-stream>
        </p>
      </div>
    );
  }

  if (logoutLoading) {
    return (
      <div className="spinner-container">
        <p>Logging out...</p>
        <l-spiral size="40" speed="0.9" color="blue"></l-spiral>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div style={styles.container}>
      <button style={menuButtonStyle} title="Side Menu" onClick={toggleMenu}>
        <i className="fa fa-bars"></i>
      </button>
      {isMenuOpen && <div style={overlayStyle} onClick={toggleMenu}></div>}
      {userRole && (
        <div style={sideMenuStyle}>
          <button style={closeMenuButtonStyle} onClick={toggleMenu}>
            <i className="fa fa-times"></i>
          </button>
          <img
            src={logo1}
            alt="Study Group Logo"
            style={styles.profilePicture}
          />
          <button
            style={{ ...sideMenuButtonStyle, backgroundColor: "green" }}
            onClick={() => {
              navigate("/profile");
              toggleMenu();
            }}
          >
            Profile
          </button>
          <button
            style={sideMenuButtonStyle}
            onClick={() => {
              navigate("/weekly-leaderboard");
              toggleMenu();
            }}
          >
            Leaderboard
          </button>
          <button
            style={sideMenuButtonStyle}
            onClick={() => {
              navigate("/texting");
              toggleMenu();
            }}
          >
            Messages {textUnreadCount > 0 && `(${textUnreadCount})`}
          </button>
          {userRole === "special" && (
            <button
              style={sideMenuButtonStyle}
              onClick={() => {
                navigate("/challenge");
                toggleMenu();
              }}
            >
              Challenges
            </button>
          )}
          <button
            style={{ ...sideMenuButtonStyle, backgroundColor: "gold" }}
            onClick={() => {
              navigate("/record");
              toggleMenu();
            }}
          >
            Quiz Records
          </button>
          <button
            style={{ ...sideMenuButtonStyle, backgroundColor: "red" }}
            onClick={handleLogout}
          >
            Logout
          </button>
          <button
            onClick={() => {
              navigate("/about");
              toggleMenu();
            }}
            style={sideMenuButtonStyle}
          >
            About
          </button>
        </div>
      )}
      <div style={styles.background}></div>
      <div style={styles.header}>
        <button
          onClick={() => navigate("/users")}
          style={styles.leaderboardButton}
          title="Prime Community"
        >
          <i className="fa fa-users" style={styles.icon}></i>
        </button>
        <h2 style={styles.label}>Welcome, {username || "User"}!</h2>
        <button
          onClick={() => navigate("/profile")}
          style={styles.profileButton}
          title="Profile"
        >
          <i className="fa fa-user" style={styles.icon}></i>
        </button>
        <StreakTracker />
      </div>
      <div style={styles.button}>
        <div style={styles.buttonContainer}>
          <button
            onClick={() => navigate("/test-yourself")}
            style={styles.startQuizButton}
          >
            📝 Practice Quiz
          </button>
          <button
            onClick={() => navigate("/messages")}
            style={{ ...styles.startQuizButton, position: "relative" }}
          >
            🔔 Notifications
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            {textUnreadCount > 0 && (
              <span style={styles.badge}>{textUnreadCount}</span>
            )}
          </button>
          <button
            onClick={() => navigate("/complaint")}
            style={styles.startQuizButton}
          >
            ⚠️ Report an issue
          </button>
        </div>
      </div>
      <div style={styles.scrollableContainer}>
        <div style={styles.content}>
          <div style={styles.motivationalQuotes}>
            <h3 style={styles.title}>Motivational Quotes</h3>
            <div style={styles.quoteCard}>
              <p style={styles.quoteText}>"{quotes[currentQuoteIndex].text}"</p>
              <p style={styles.quoteAuthor}>
                ~ {quotes[currentQuoteIndex].author}
              </p>
            </div>
          </div>
          <div style={styles.studyTips}>
            <h3 style={styles.title}>Study Tips for Success</h3>
            <div style={styles.studyCard}>
              <ul style={styles.tipsList}>
                {studyTips.map((tip, index) => (
                  <li key={index} style={styles.tipItem}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div style={styles.scrollingContainer}>
        <div style={styles.scrollingText}>
          🌟 Every small effort you make today builds the success of tomorrow.
          Keep pushing, keep learning — your dreams are worth it! 🌟 Your
          journey matters. Keep striving, keep growing. Prime Academy believes
          in you! 🌟 Success is the sum of small efforts repeated every day.
          Keep pushing! 🌟 You’re not just studying — you’re building a future
          to be proud of. 🌟 Every quiz you take is one step closer to mastering
          your field! 🌟 &nbsp;&nbsp;&nbsp;&nbsp; 🌟 Every small effort you make
          today builds the success of tomorrow. Keep pushing, keep learning —
          your dreams are worth it! 🌟 Your journey matters. Keep striving, keep
          growing. Prime Academy believes in you! 🌟 Success is the sum of small
          efforts repeated every day. Keep pushing! 🌟 You’re not just studying
          — you’re building a future to be proud of. 🌟 Every quiz you take is
          one step closer to mastering your field! 🌟
        </div>
      </div>
      {showModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={modalStyles.title}>DAILY CHALLENGE</h3>
            <p style={modalStyles.text}>
              {username}, are you ready to test your knowledge?
            </p>
            <p style={modalStyles.text}>
              Take today's challenge tailored to your{" "}
              {userDetails?.programOfStudy} studies!
            </p>
            <div style={modalStyles.buttonContainer}>
              <button
                onClick={handleTakeChallenge}
                style={modalStyles.acceptButton}
              >
                ACCEPT
              </button>
              {showRulesModal && (
                <div style={modalStyles.overlay}>
                  <div style={modalStyles.modal}>
                    <h2 style={modalStyles.title}>DAILY CHALLENGE RULES</h2>
                    <p style={modalStyles.text}>
                      • You have one chance per day to take this quiz.
                      <br />
                      • No going back to previous questions.
                      <br />
                      • Complete all questions in one sitting.
                      <br />
                      • Your score will appear on the weekly leaderboard.
                      <br />
                      • For each correct answer, you earn 10 points.
                      <br />
                      • For each incorrect answer, you lose 5 points.
                      <br />
                      • Choose wisely.
                      <br />
                      <br /> GOOD LUCK !!!
                    </p>
                    <div style={modalStyles.buttonContainer}>
                      <button
                        style={modalStyles.acceptButton}
                        onClick={handleAcceptRules}
                      >
                        Accept & Start
                      </button>
                      <button
                        style={modalStyles.closeButton}
                        onClick={handleDeclineRules}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleCloseModal}
                style={modalStyles.closeButton}
              >
                DECLINE
              </button>
            </div>
          </div>
        </div>
      )}

      {showChallengeModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
              New Challenge Received!
            </h2>
            <p style={{ fontSize: "1.2rem" }}>
              You've been challenged by another user. Go check your challenges!
            </p>
            <button
              onClick={() => {
                setShowChallengeModal(false);
                navigate("/received");
              }}
              style={modalButtonStyle}
            >
              View Challenge
            </button>
            <button
              onClick={() => setShowChallengeModal(false)}
              style={{
                ...modalButtonStyle,
                backgroundColor: "#ccc",
                color: "#333",
                marginLeft: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showMessageModal && latestMessage && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
              📩 New Message Received!
            </h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "20px" }}>
              From: {latestMessage.sender}
            </p>
            <button
              onClick={() => {
                setShowMessageModal(false);
                navigate("/messages");
              }}
              style={modalButtonStyle}
            >
              Go to Messages
            </button>
            <button
              onClick={() => setShowMessageModal(false)}
              style={{
                ...modalButtonStyle,
                backgroundColor: "#ccc",
                color: "#333",
                marginLeft: "10px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* <button
        style={floatingQuizButtonStyle}
        onClick={() => navigate("/quiz-quest")}
        title="Go to Quiz Quest"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        🎯
      </button> */}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "90.5vh",
    position: "relative",
    overflow: "hidden",
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
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#FFD700",
    padding: "23px",
    textAlign: "center",
    borderRadius: "10px 10px 10px 10px",
    position: "relative",
    zIndex: 2,
    top: "10px",
    opacity: 0.8,
    marginBottom: "20px",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "95%",
    padding: "20px",
    marginLeft: "25px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
  },
  scrollableContainer: {
    flex: 1,
    marginTop: "20px",
    overflowY: "auto",
    opacity: "0.9",
    width: "98%",
  },
  label: {
    fontSize: "45px",
  },
  title: {
    fontSize: "30px",
  },
  button: {
    padding: "10px",
    display: "flex",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    width: "90%",
    marginTop: "10px",
    flexDirection: "row",
  },
  motivationalQuotes: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    width: "100%",
    marginBottom: "20px",
  },
  quoteCard: {
    textAlign: "center",
    fontStyle: "italic",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
    opacity: 1,
    transition: "opacity 1s ease-in-out",
  },
  studyCard: {
    textAlign: "justify",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.4)",
    opacity: 1,
    transition: "opacity 1s ease-in-out",
  },
  quoteText: {
    fontSize: "35px",
    color: "#000000",
    marginBottom: "10px",
    opacity: 5,
    transition: "opacity 1s ease-in-out",
  },
  quoteAuthor: {
    fontSize: "25px",
    color: "#555",
  },
  studyTips: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    width: "100%",
    marginBottom: "20px",
  },
  tipsList: {
    listStyleType: "disc",
    paddingLeft: "20px",
    color: "#000000",
    fontSize: "25px",
  },
  tipItem: {
    marginBottom: "10px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: "20px",
    width: "100%",
    margin: "10px auto",
  },
  startQuizButton: {
    fontSize: "40px",
    fontWeight: "900",
    backgroundColor: "#FFD700",
    color: "black",
    borderRadius: "8px",
    cursor: "pointer",
    width: "80%",
    transition: "background-color 0.3s",
    textAlign: "center",
    border: "2px solid black",
  },
  icon: {
    marginRight: "8px",
    fontSize: "40px",
    color: "black",
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "50px",
    border: "2px solid black",
  },
  leaderboardButton: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  profileButton: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
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
  badge: {
    position: "absolute",
    top: "20px",
    right: "15px",
    backgroundColor: "red",
    color: "white",
    borderRadius: "30px",
    padding: "4px 8px",
    fontSize: "16px",
    fontWeight: "800",
    minWidth: "24px",
    textAlign: "center",
    lineHeight: "1",
  },
  profilePicture: {
    width: "240px",
    height: "200px",
    borderRadius: "30%",
    objectFit: "cover",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "700px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    animation: "flyInUp 1s ease-out",
  },
  title: {
    marginBottom: "15px",
    fontSize: "35px",
    fontWeight: 900,
    color: "#333",
  },
  text: {
    marginBottom: "20px",
    fontSize: "25px",
    color: "#555",
    textAlign: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  acceptButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "2px solid black",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: 900,
  },
  closeButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "2px solid black",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: 900,
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

  @keyframes flyInUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
`;

export default Dashboard;
