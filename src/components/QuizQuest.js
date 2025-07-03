import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import questionsData from "../questions/questions.json";
import { dotStream } from "ldrs";
import { FaArrowCircleLeft } from "react-icons/fa";

const COOLDOWN_MINUTES = 15;
const SUCCESS_POINTS = 10;
const INITIAL_LIVES = 3;
const COMPLETION_THRESHOLD = 0.8;

const initialUserData = { questPoints: 0, badges: [] };
const initialMissionProgress = {
  questPoints: 0,
  correctAnswers: 0,
  completed: false,
  lives: INITIAL_LIVES,
};

const QuizQuest = () => {
  const [missions, setMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [questPoints, setQuestPoints] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(initialUserData);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  dotStream.register();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
        return;
      }
      setUser(currentUser);
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const userInfo = userDoc.exists() ? userDoc.data() : null;
      if (userInfo && !["user", "special"].includes(userInfo.role)) {
        setError("Unauthorized access.");
        navigate("/login");
        return;
      }
      setUserData({
        questPoints: userInfo?.questPoints || 0,
        badges: userInfo?.badges || [],
      });
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMissions = async () => {
      setLoading(true);
      try {
        const missionsRef = collection(db, "gameQuests");
        const unsubscribe = onSnapshot(missionsRef, async (snapshot) => {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userInfo = userDoc.data();
          const missionsList = await Promise.all(
            snapshot.docs.map(async (missionDoc) => {
              const data = missionDoc.data();
              const progressRef = doc(
                db,
                "gameQuests",
                missionDoc.id,
                "progress",
                user.uid
              );
              const progressDoc = await getDoc(progressRef);
              let progress = progressDoc.exists()
                ? progressDoc.data()
                : initialMissionProgress;

              const now = new Date();

              if (
                progress.retryAvailableAt &&
                progress.lives === 0 &&
                progress.retryAvailableAt.toDate() < now
              ) {
                await setDoc(
                  progressRef,
                  {
                    lives: 3,
                    currentQuestionIndex: 0,
                    retryAvailableAt: null,
                    correctAnswers: 0,
                    completed: false,
                  },
                  { merge: true }
                );
                progress = {
                  ...progress,
                  lives: 3,
                  currentQuestionIndex: 0,
                  retryAvailableAt: null,
                  correctAnswers: 0,
                  completed: false,
                };
              }
              const start =
                data.startTime instanceof Timestamp
                  ? data.startTime.toDate()
                  : new Date(data.startTime);
              const end =
                data.endTime instanceof Timestamp
                  ? data.endTime.toDate()
                  : new Date(data.endTime);

              const status =
                now < start ? "scheduled" : now > end ? "expired" : "active";
              const availableQuestions = questionsData.filter(
                (q) =>
                  (!data.level || q.levelOfStudy === data.level) &&
                  (!data.program || q.programOfStudy === data.program) &&
                  (!data.semester || q.semesterOfStudy === data.semester) &&
                  q.course === data.course
              ).length;

              return {
                id: missionDoc.id,
                ...data,
                startTime: start,
                endTime: end,
                status,
                progress: {
                  ...initialMissionProgress,
                  ...progress,
                },
                isAccessible:
                  (!data.level || data.level === userInfo.levelOfStudy) &&
                  (!data.program || data.program === userInfo.programOfStudy) &&
                  (!data.semester ||
                    data.semester === userInfo.semesterOfStudy) &&
                  availableQuestions >= data.questionCount,
                availableQuestions,
              };
            })
          );
          setMissions(missionsList);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (err) {
        setError(`Failed to load missions: ${err.message}`);
        setLoading(false);
      }
    };

    fetchMissions();
  }, [user]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const getTimeLeft = (endTime) => {
    let endDate;
    if (endTime instanceof Timestamp) {
      endDate = endTime.toDate();
    } else if (endTime instanceof Date) {
      endDate = endTime;
    } else if (typeof endTime === "string") {
      endDate = new Date(endTime);
    } else {
      return "Invalid time";
    }

    if (isNaN(endDate.getTime())) return "Invalid time";

    const diff = endDate - currentTime;
    if (diff <= 0) return "Expired";

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(" ");
  };

  const startMission = async (mission) => {
    if (mission.status !== "active" || !mission.isAccessible) {
      const lastAttempt =
        mission.progress.lastAttempt instanceof Timestamp
          ? mission.progress.lastAttempt.toDate()
          : new Date(mission.progress.lastAttempt);
      if (
        mission.progress.lives === 0 &&
        lastAttempt &&
        !isNaN(lastAttempt.getTime())
      ) {
        const now = new Date();
        const nextAvailable = new Date(
          lastAttempt.getTime() + COOLDOWN_MINUTES * 60000
        );
        if (now < nextAvailable) {
          const timeLeft = Math.ceil((nextAvailable - now) / 60000);
          setError(`You’re out of lives! Try again in ${timeLeft} minute(s).`);
          return;
        } else {
          const progressRef = doc(
            db,
            "gameQuests",
            mission.id,
            "progress",
            user.uid
          );
          try {
            await setDoc(
              progressRef,
              { lives: INITIAL_LIVES, retryAvailableAt: null },
              { merge: true }
            );
            setMissions((prevMissions) =>
              prevMissions.map((m) =>
                m.id === mission.id
                  ? {
                      ...m,
                      progress: {
                        ...m.progress,
                        lives: INITIAL_LIVES,
                        retryAvailableAt: null,
                      },
                    }
                  : m
              )
            );
          } catch (err) {
            console.error("Error resetting lives:", err);
            setError(`Failed to reset lives: ${err.message}`);
            return;
          }
        }
      }
      if (mission.status !== "active") {
        setError("This mission is not available.");
        return;
      }
      if (!mission.isAccessible) {
        setError("Not enough questions available for this mission.");
        return;
      }
    }

    setCurrentMission(mission);
    setCurrentQuestionIndex(mission.progress.questionIndex || 0);
    setLives(
      mission.progress.lives === 0 ? INITIAL_LIVES : mission.progress.lives
    );
    setQuestPoints(mission.progress.questPoints);
    setCorrectAnswers(mission.progress.correctAnswers);
    setFeedback("");

    const filteredQuestions = questionsData
      .filter(
        (q) =>
          (!mission.level || q.levelOfStudy === mission.level) &&
          (!mission.program || q.programOfStudy === mission.program) &&
          (!mission.semester || q.semesterOfStudy === mission.semester) &&
          q.course === mission.course
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, mission.questionCount);

    if (filteredQuestions.length < mission.questionCount) {
      setError(
        `Not enough questions available. Required: ${mission.questionCount}, Available: ${filteredQuestions.length}`
      );
      setCurrentMission(null);
      return;
    }
    setQuestions(filteredQuestions);
  };

  const handleExitMission = async () => {
    if (!currentMission) return;

    const progressRef = doc(
      db,
      "gameQuests",
      currentMission.id,
      "progress",
      user.uid
    );
    await setDoc(
      progressRef,
      {
        correctAnswers,
        questPoints,
        lives,
        completed: false,
        lastAttempt: Timestamp.fromDate(new Date()),
        questionIndex: currentQuestionIndex,
      },
      { merge: true }
    );

    setFeedback("Progress saved. You can continue later.");
    setCurrentMission(null);
  };

  const handleAnswer = async () => {
    if (!userAnswer) {
      setFeedback("Please select an answer.");
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectAnswers(correctAnswers + 1);
      setQuestPoints(questPoints + SUCCESS_POINTS);
      setFeedback("Correct! +10 QP");
      setUserData((prev) => ({
        ...prev,
        questPoints: prev.questPoints + SUCCESS_POINTS,
      }));
    } else {
      setLives(lives - 1);
      setFeedback(`Incorrect. ${currentQuestion.explanation || "Try again!"}`);
    }

    const newCorrectAnswers = correctAnswers + (isCorrect ? 1 : 0);
    const isCompleted =
      newCorrectAnswers >=
      Math.ceil(currentMission.questionCount * COMPLETION_THRESHOLD);
    const newLives = isCorrect ? lives : lives - 1;

    const progressRef = doc(
      db,
      "gameQuests",
      currentMission.id,
      "progress",
      user.uid
    );

    const retryAvailableAt =
      newLives <= 0
        ? Timestamp.fromDate(new Date(Date.now() + COOLDOWN_MINUTES * 60000))
        : null;

    await setDoc(
      progressRef,
      {
        questPoints: questPoints + (isCorrect ? SUCCESS_POINTS : 0),
        correctAnswers: newCorrectAnswers,
        lives: newLives,
        completed: isCompleted,
        lastAttempt: Timestamp.fromDate(new Date()),
        questionIndex: isCorrect
          ? currentQuestionIndex + 1
          : currentQuestionIndex,
        retryAvailableAt,
      },
      { merge: true }
    );

    const userRef = doc(db, "users", user.uid);
    const newBadges = isCompleted
      ? [...(userData.badges || []), `${currentMission.course} Master`]
      : userData.badges || [];
    await setDoc(
      userRef,
      {
        questPoints: userData.questPoints + (isCorrect ? SUCCESS_POINTS : 0),
        badges: newBadges,
      },
      { merge: true }
    );

    setUserData((prev) => ({
      ...prev,
      badges: newBadges,
    }));

    setMissions((prevMissions) =>
      prevMissions.map((m) =>
        m.id === currentMission.id
          ? {
              ...m,
              progress: {
                ...m.progress,
                questPoints: questPoints + (isCorrect ? SUCCESS_POINTS : 0),
                correctAnswers: newCorrectAnswers,
                lives: newLives,
                completed: isCompleted,
                lastAttempt: Timestamp.fromDate(new Date()),
                questionIndex: isCorrect
                  ? currentQuestionIndex + 1
                  : currentQuestionIndex,
                retryAvailableAt,
              },
            }
          : m
      )
    );

    if (newLives <= 0) {
      setFeedback(`Out of lives! Retry in ${COOLDOWN_MINUTES} minute(s).`);
      setCurrentMission(null);
      return;
    }

    if (isCompleted) {
      setFeedback("Mission completed! You earned a badge!");
      setCurrentMission(null);
      return;
    }

    if (isCorrect && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
    } else if (!isCorrect) {
      setUserAnswer("");
    } else {
      setFeedback("Mission ended. Check your progress!");
      setCurrentMission(null);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <p style={{ fontSize: "36px", color: "blue" }}>
          Loading Missions <l-dot-stream size="60" speed="2.5" color="blue" />
        </p>
      </div>
    );
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        <div style={styles.buttonContainer}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FaArrowCircleLeft size={20} /> Go Back
          </button>
        </div>
        <h1 style={styles.head}>Quiz Quest</h1>
      </div>
      <div style={styles.sideBySide}>
        <div style={styles.leftPanel}>
          <h2 style={styles.subTitle}>Your Progress</h2>
          <div style={styles.progressContainer}>
            <p style={styles.progressText}>
              Total Quest Points: {userData.questPoints}
            </p>
            <h3 style={styles.subTitle}>Badges</h3>
            {userData.badges.length > 0 ? (
              <ul style={styles.badgeList}>
                {userData.badges.map((badge, index) => (
                  <li key={index} style={styles.badgeItem}>
                    🏅 {badge}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.noDataText}>No badges earned yet.</p>
            )}
            <h3 style={styles.subTitle}>Mission Progress</h3>
            {missions.length > 0 ? (
              <ul style={styles.progressList}>
                {missions.map((mission) => (
                  <li key={mission.id} style={styles.progressItem}>
                    <p>
                      <strong>{mission.course}</strong>:{" "}
                      {mission.progress.correctAnswers}/{mission.questionCount}{" "}
                      correct
                    </p>
                    <p>Points Earned: {mission.progress.questPoints}</p>
                    <p>
                      Status:{" "}
                      {mission.progress.completed ? "Completed" : "In Progress"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.noDataText}>No mission progress yet.</p>
            )}
          </div>
        </div>
        <div style={styles.rightPanel}>
          {!currentMission ? (
            <div style={styles.mapContainer}>
              <h2 style={styles.subTitle}>Available Missions</h2>
              <div style={styles.missionGrid}>
                {missions.map((mission) => {
                  const lastAttempt =
                    mission.progress.lastAttempt instanceof Timestamp
                      ? mission.progress.lastAttempt.toDate()
                      : new Date(mission.progress.lastAttempt);
                  const retryAvailableAt =
                    mission.progress.retryAvailableAt instanceof Timestamp
                      ? mission.progress.retryAvailableAt.toDate()
                      : mission.progress.retryAvailableAt;
                  const isCoolingDown =
                    mission.progress.lives === 0 &&
                    retryAvailableAt &&
                    new Date() < retryAvailableAt;

                  return (
                    <div
                      key={mission.id}
                      style={{
                        ...styles.missionCard,
                        backgroundColor: mission.progress.completed
                          ? "#999"
                          : mission.isAccessible
                          ? mission.status === "active"
                            ? "#4CAF50"
                            : "#ccc"
                          : "#f44336",
                        cursor:
                          mission.progress.completed || isCoolingDown
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          mission.progress.completed || isCoolingDown ? 0.6 : 1,
                      }}
                      onClick={() => {
                        if (
                          mission.isAccessible &&
                          !mission.progress.completed &&
                          !isCoolingDown
                        ) {
                          startMission(mission);
                        }
                      }}
                    >
                      <h3>{mission.course}</h3>
                      <p>Questions: {mission.questionCount}</p>
                      <p>Rewards: {mission.rewards}</p>

                      {mission.progress.completed ? (
                        <>
                          <p style={{ fontWeight: "bold", color: "green" }}>
                            Score: {mission.progress.correctAnswers} /{" "}
                            {mission.questionCount}
                          </p>
                        </>
                      ) : (
                        <>
                          <p>Status: {mission.status}</p>
                          {mission.status === "scheduled" && (
                            <p>Starts in: {getTimeLeft(mission.startTime)}</p>
                          )}

                          {mission.status === "active" && (
                            <p>Ends in: {getTimeLeft(mission.endTime)}</p>
                          )}

                          <p>
                            Progress:{" "}
                            {mission.progress.correctAnswers > 0
                              ? "Not Completed"
                              : "Not Started"}
                          </p>

                          {mission.progress.lives === 0 &&
                            retryAvailableAt &&
                            isCoolingDown && (
                              <p
                                style={{ color: "orange", fontWeight: "bold" }}
                              >
                                Retry in: {getTimeLeft(retryAvailableAt)}
                              </p>
                            )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={styles.questionContainer}>
              <h2>{currentMission.course} Mission</h2>
              <p>Lives: {lives}</p>
              <p>Quest Points: {questPoints}</p>
              <p>
                Correct Answers: {correctAnswers}/
                {Math.ceil(currentMission.questionCount * COMPLETION_THRESHOLD)}
              </p>
              <button
                style={{
                  ...styles.submitButton,
                  backgroundColor: "#d9534f",
                  marginBottom: "30px",
                }}
                onClick={handleExitMission}
              >
                Exit Quiz
              </button>
              <div style={styles.question}>
                <h3>{questions[currentQuestionIndex].question}</h3>
                {questions[currentQuestionIndex].options.map(
                  (option, index) => (
                    <button
                      key={index}
                      style={{
                        ...styles.optionButton,
                        backgroundColor:
                          userAnswer === option ? "#007bff" : "#f0f0f0",
                      }}
                      onClick={() => setUserAnswer(option)}
                    >
                      {option}
                    </button>
                  )
                )}
                <button style={styles.submitButton} onClick={handleAnswer}>
                  Submit
                </button>
                {feedback && <p style={styles.feedback}>{feedback}</p>}
              </div>
            </div>
          )}
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
          your field! 🌟
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Poppins', sans-serif",
    textAlign: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
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
  buttonContainer: {
    position: "absolute",
    top: "15px",
    left: "15px",
  },
  title: {
    position: "fixed",
    top: "5px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    margin: 0,
    backgroundColor: "#ffffff",
    boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
    zIndex: 1000,
    textAlign: "center",
    borderRadius: "10px",
  },
  head: {
    fontSize: "32px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  sideBySide: {
    display: "flex",
    position: "fixed",
    top: "95px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "95%",
    height: "calc(89vh - 70px)",
    zIndex: 500,
    borderRadius: "15px",
    gap: "10px",
  },
  leftPanel: {
    width: "40%",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    overflowY: "auto",
    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
    borderRadius: "15px",
  },
  rightPanel: {
    width: "60%",
    padding: "20px",
    backgroundColor: "#ffffff",
    overflowY: "auto",
    boxShadow: "-2px 0 6px rgba(0,0,0,0.1)",
    borderRadius: "15px",
  },
  subTitle: {
    fontSize: "25px",
    fontWeight: "800",
    marginBottom: "15px",
    backgroundColor: "inherit",
    zIndex: 10,
    padding: "10px 0",
    textTransform: "uppercase",
  },
  progressContainer: { textAlign: "left" },
  progressText: { fontSize: "18px", margin: "10px 0" },
  badgeList: { listStyle: "none", padding: 0 },
  badgeItem: { fontSize: "16px", margin: "5px 0" },
  progressList: { listStyle: "none", padding: 0 },
  progressItem: {
    margin: "10px 0",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#e0e0e0",
  },
  noDataText: { fontSize: "16px", color: "#666" },
  mapContainer: { maxWidth: "100%" },
  missionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  missionCard: {
    padding: "15px",
    borderRadius: "8px",
    color: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
  questionContainer: { maxWidth: "100%" },
  question: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  },
  optionButton: {
    display: "block",
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "20px",
    width: "80%",
    fontSize: "16px",
  },
  feedback: {
    marginTop: "15px",
    fontSize: "16px",
    color: "#333",
  },
  error: {
    color: "red",
    fontSize: "16px",
    textAlign: "center",
    marginTop: "80px",
  },
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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

const globalStyles = `
  @keyframes scrollText {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes flyIn {
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0%); opacity: 1; }
  }
  @keyframes flyInUp {
    from { transform: translateY(100px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

export default QuizQuest;
