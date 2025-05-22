import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  query,
  collection,
  where,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import logo from "../assets/op.jpg";
import useInactivityLogout from "./useInactivityLogout";
import StreakTracker from "./StreakTracker";
import { dotStream, spiral } from "ldrs";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [hasTakenDailyQuiz, setHasTakenDailyQuiz] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const authInstance = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [authInstance, navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username);
            setUserDetails({
              levelOfStudy: userData.levelOfStudy,
              programOfStudy: userData.programOfStudy,
              semesterOfStudy: userData.semesterOfStudy,
            });

            // const today = new Date();
            // today.setHours(0, 0, 0, 0);
            // const quizQuery = query(
            //   collection(db, "dailyQuizzes"),
            //   where("userId", "==", currentUser.uid),
            //   where("timestamp", ">=", Timestamp.fromDate(today))
            // );
            // const quizSnapshot = await getDocs(quizQuery);
            // const hasTakenToday = !quizSnapshot.empty;
            // setHasTakenDailyQuiz(hasTakenToday);
            // setHasTakenDailyQuiz(!quizSnapshot.empty);
            // setShowModal(!hasTakenToday);
          } else {
            setUsername(currentUser.displayName || "User");
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setShowModal(true);
        }
        setLoading(false);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserId(currentUser.uid);
    }
    if (currentUserId) {
      const challengesQuery = query(
        collection(db, "challenges"),
        where("receiverId", "==", currentUserId),
        where("status", "==", "pending")
      );
      const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
        if (!snapshot.empty) {
          alert("You have received a new challenge!");
        }
      });
      return () => unsubscribe();
    }
  }, [currentUserId]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  useEffect(() => {
    let unsubscribeStatus;
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      unsubscribeStatus = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            if (userData.status === "offline") {
              handleForcedLogout();
            }
          }
        },
        (error) => {
          console.error("Error checking user status:", error);
        }
      );
    }

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
    };
  }, [currentUser]);

  const handleForcedLogout = async () => {
    try {
      setLogoutLoading(true);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error during forced logout:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

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

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <button
          onClick={() => navigate("/users")}
          style={styles.leaderboardButton}
        >
          <i className="fa fa-users" style={styles.icon}></i>
        </button>
        <h2 style={styles.label}>Welcome, {username || "User"}!</h2>
        <button
          onClick={() => navigate("/profile")}
          style={styles.profileButton}
        >
          <i className="fa fa-user" style={styles.icon}></i>
        </button>
        <StreakTracker />
      </div>
      <div style={styles.button}>
        <div style={styles.buttonContainer}>
          {/* <button onClick={() => navigate('/quiz')} style={styles.startQuizButton}>Compete Now</button> */}
          <button
            onClick={() => navigate("/test-yourself")}
            style={styles.startQuizButton}
          >
            Practice Quiz
          </button>
          {/* <button onClick={() => navigate('/live-quiz')} style={styles.startQuizButton}>Live Quizzes</button> */}
          <button
            onClick={() => navigate("/weekly-leaderboard")}
            style={styles.startQuizButton}
          >
            Weekly Leader Board
          </button>
          {/* <button onClick={() => navigate('/challenge')} style={styles.startQuizButton}>Challenge a Friend</button> */}
          {/* <button onClick={() => navigate('/received')} style={styles.startQuizButton}>See your challenges</button> */}
        </div>
      </div>
      {/* <button onClick={() => navigate('/users')} style={styles.userButton}>Meet the Brain Snacks Community</button> */}
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
  userButton: {
    padding: "15px",
    display: "flex",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
    width: "90%",
    marginTop: "10px",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    fontWeight: "800",
    color: "black",
    backgroundColor: "#AED6F1",
    flexDirection: "row",
    opacity: "0.7",
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
