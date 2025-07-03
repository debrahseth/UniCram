import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { dotStream } from "ldrs";
import questionsData from "../questions/questions.json";
import logo from "../assets/op.jpg";

const LiveQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    levelOfStudy: stateLevel,
    programOfStudy: stateProgram,
    semesterOfStudy: stateSemester,
  } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [quizSchedule, setQuizSchedule] = useState(null);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  dotStream.register();

  useEffect(() => {
    const fetchQuizScheduleAndData = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }
        const userData = userSnap.data();
        const level = stateLevel || userData.levelOfStudy;
        const program = stateProgram || userData.programOfStudy;
        const semester = stateSemester || userData.semesterOfStudy;

        if (!level || !program || !semester) {
          console.warn(
            "Missing levelOfStudy, programOfStudy, or semesterOfStudy"
          );
          setLoading(false);
          return;
        }

        // Fetch all active quizzes
        const now = new Date();
        const q = query(
          collection(db, "liveQuizzes"),
          where("status", "==", "scheduled"),
          where("startTime", "<=", Timestamp.fromDate(now)),
          where("endTime", ">=", Timestamp.fromDate(now)),
          where("level", "in", [level, null]),
          where("program", "in", [program, null])
        );

        const querySnapshot = await getDocs(q);
        const quizzes = [];
        querySnapshot.forEach((doc) => {
          quizzes.push({ id: doc.id, ...doc.data() });
        });
        setAvailableQuizzes(quizzes);

        if (quizzes.length === 0) {
          setIsQuizOpen(false);
          setLoading(false);
          return;
        }

        // Automatically select the first quiz if none is selected
        if (!selectedQuiz && quizzes.length > 0) {
          setSelectedQuiz(quizzes[0]);
          setQuizSchedule(quizzes[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz schedule or user data:", error);
        setLoading(false);
      }
    };

    fetchQuizScheduleAndData();
  }, [stateLevel, stateProgram, stateSemester]);

  useEffect(() => {
    const fetchQuestionsAndCheckQuiz = async () => {
      if (!selectedQuiz || !auth.currentUser) return;

      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const level = stateLevel || userData.levelOfStudy;
        const program = stateProgram || userData.programOfStudy;
        const semester = stateSemester || userData.semesterOfStudy;

        // Filter questions for the selected quiz
        const filteredQuestions = questionsData.filter(
          (q) =>
            q.levelOfStudy === level &&
            q.programOfStudy === program &&
            q.semesterOfStudy === semester &&
            q.course === selectedQuiz.course
        );
        setQuestions(filteredQuestions);

        // Check if user has taken the selected quiz
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfToday = Timestamp.fromDate(today);
        const quizQuery = query(
          collection(db, "liveQuizResults"),
          where("userId", "==", auth.currentUser.uid),
          where("quizId", "==", selectedQuiz.id),
          where("timestamp", ">=", startOfToday)
        );
        const quizSnapshot = await getDocs(quizQuery);
        setHasTakenQuiz(!quizSnapshot.empty);

        // Check if the quiz is still open
        const now = new Date();
        const endTime = new Date(selectedQuiz.endTime);
        const startTime = new Date(selectedQuiz.startTime);
        setIsQuizOpen(now >= startTime && now < endTime);
      } catch (error) {
        console.error("Error fetching questions or quiz status:", error);
      }
    };

    fetchQuestionsAndCheckQuiz();
  }, [selectedQuiz, stateLevel, stateProgram, stateSemester]);

  useEffect(() => {
    const updateCountdown = () => {
      if (!quizSchedule) return;

      const now = new Date();
      const endTime = new Date(quizSchedule.endTime);
      const startTime = new Date(quizSchedule.startTime);
      const timeDiff = endTime - now;

      if (now >= startTime && now < endTime) {
        setIsQuizOpen(true);
        setTimeLeft(timeDiff);
      } else {
        setIsQuizOpen(false);
        setTimeLeft(null);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [quizSchedule]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizSchedule(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setHasTakenQuiz(false);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (submitting || !isQuizOpen) {
      setSubmitting(false);
      return;
    }
    setSubmitting(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newScore = score + (isCorrect ? 10 : -5);

    if (currentQuestionIndex + 1 < questions.length) {
      setScore(newScore);
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setSubmitting(false);
    } else {
      try {
        if (!auth.currentUser) {
          setSubmitting(false);
          return;
        }
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const level = stateLevel || userData.levelOfStudy;
        const program = stateProgram || userData.programOfStudy;
        const semester = stateSemester || userData.semesterOfStudy;

        if (
          !level ||
          !program ||
          !semester ||
          !selectedQuiz?.course ||
          !selectedQuiz?.id
        ) {
          console.error("Missing required fields for quiz submission");
          setSubmitting(false);
          return;
        }

        const q = query(
          collection(db, "liveQuizResults"),
          where("userId", "==", auth.currentUser.uid),
          where("quizId", "==", selectedQuiz.id),
          where(
            "timestamp",
            ">=",
            Timestamp.fromDate(new Date().setHours(0, 0, 0, 0))
          )
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          const existingData = querySnapshot.docs[0].data();
          const existingScore =
            typeof existingData.score === "number" ? existingData.score : 0;
          const existingQuestion =
            typeof existingData.totalQuestions === "number"
              ? existingData.totalQuestions
              : 0;

          await updateDoc(docRef, {
            score: existingScore + newScore,
            timestamp: Timestamp.fromDate(new Date()),
            totalQuestions: existingQuestion + questions.length,
            course: selectedQuiz.course,
            quizId: selectedQuiz.id,
          });
        } else {
          await addDoc(collection(db, "liveQuizResults"), {
            userId: auth.currentUser.uid,
            timestamp: Timestamp.fromDate(new Date()),
            score: newScore,
            totalQuestions: questions.length,
            levelOfStudy: level,
            programOfStudy: program,
            semesterOfStudy: semester,
            course: selectedQuiz.course,
            quizId: selectedQuiz.id,
          });
        }
        setScore(newScore);
        setQuizCompleted(true);
      } catch (error) {
        console.error("Error submitting quiz:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate(-1);
  };

  const totalScore = questions.length * 10;

  const formatTime = (ms) => {
    if (!ms) return "0s";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h : ${minutes}m : ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m : ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div style={styles.spinnerContainer}>
        <div style={styles.background}></div>
        <div style={{ fontSize: "36px", color: "blue" }}>
          Loading{" "}
          <l-dot-stream size="60" speed="2.5" color="blue"></l-dot-stream>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Available Live Quizzes</h3>
        {availableQuizzes.length === 0 ? (
          <p style={styles.sidebarMessage}>No active quizzes available.</p>
        ) : (
          <ul style={styles.quizList}>
            {availableQuizzes.map((quiz) => (
              <li
                key={quiz.id}
                style={{
                  ...styles.quizItem,
                  backgroundColor:
                    selectedQuiz?.id === quiz.id ? "#e0f7fa" : "#f8f9fa",
                }}
                onClick={() => handleQuizSelect(quiz)}
              >
                <p style={styles.quizTitle}>
                  {quiz.course || "Unknown Course"}
                </p>
                <p style={styles.quizDetails}>
                  Start: {new Date(quiz.startTime.toDate()).toLocaleString()}
                </p>
                <p style={styles.quizDetails}>
                  End: {new Date(quiz.endTime.toDate()).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.mainContent}>
        {selectedQuiz ? (
          <>
            {!isQuizOpen ? (
              <div style={styles.messageContainer}>
                <h2 style={styles.messageTitle}>
                  Quiz is closed. Next quiz starts at{" "}
                  {new Date(selectedQuiz.startTime.toDate()).toLocaleString()}.
                </h2>
                <button onClick={handleBackToDashboard} style={styles.button}>
                  BACK TO DASHBOARD
                </button>
              </div>
            ) : hasTakenQuiz ? (
              <div style={styles.messageContainer}>
                <h2 style={styles.messageTitle}>
                  You have already taken the {selectedQuiz.course} quiz.
                </h2>
                <button onClick={handleBackToDashboard} style={styles.button}>
                  BACK TO DASHBOARD
                </button>
              </div>
            ) : !questions.length ? (
              <div style={styles.messageContainer}>
                <h2 style={styles.messageTitle}>
                  No questions available for this quiz.
                </h2>
                <button onClick={handleBackToDashboard} style={styles.button}>
                  BACK TO DASHBOARD
                </button>
              </div>
            ) : quizCompleted ? (
              <div style={styles.messageContainer}>
                <h2 style={styles.messageTitle}>Quiz Completed!</h2>
                <div style={styles.contain}>
                  <div style={styles.mainContainer}>
                    <h3 style={styles.title}>YOUR SCORE</h3>
                    <div style={styles.miniScoresContainer}>
                      <div style={styles.miniContain}>
                        {score} / {totalScore}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleBackToDashboard} style={styles.button}>
                  BACK TO DASHBOARD
                </button>
              </div>
            ) : (
              <>
                <div style={styles.timerContainer}>
                  <p style={styles.questionNumber}>
                    LIVE QUIZ - {selectedQuiz.course}
                  </p>
                  <p style={styles.questionNumber}>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      color: "#ef4444",
                      fontWeight: "500",
                    }}
                  >
                    Time Left: {formatTime(timeLeft)}
                  </p>
                </div>
                <div style={styles.cont}>
                  <p style={styles.questionText}>
                    Question {currentQuestionIndex + 1}:{" "}
                    {questions[currentQuestionIndex].question}
                  </p>
                </div>
                <div style={styles.Container}>
                  {questions[currentQuestionIndex].imageUrl && (
                    <img
                      src={questions[currentQuestionIndex].imageUrl}
                      alt="Question illustration"
                      style={styles.questionImage}
                    />
                  )}
                  <div style={styles.questionCard}>
                    <div style={styles.optionsContainer}>
                      {questions[currentQuestionIndex].options.map(
                        (option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            style={{
                              ...styles.optionButton,
                              backgroundColor:
                                selectedAnswer === option
                                  ? "#007bff"
                                  : "#f8f9fa",
                              color:
                                selectedAnswer === option ? "#fff" : "#333",
                            }}
                          >
                            {option}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div style={styles.navigation}>
                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null || !isQuizOpen}
                    style={{
                      ...styles.button1,
                      opacity: selectedAnswer === null || !isQuizOpen ? 0.5 : 1,
                      cursor:
                        selectedAnswer === null || !isQuizOpen
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {submitting
                      ? currentQuestionIndex + 1 === questions.length
                        ? "Submitting..."
                        : "Loading..."
                      : currentQuestionIndex + 1 === questions.length
                      ? "FINISH"
                      : "NEXT"}
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div style={styles.messageContainer}>
            <h2 style={styles.messageTitle}>
              Select a quiz from the list to start.
            </h2>
            <button onClick={handleBackToDashboard} style={styles.button}>
              BACK TO DASHBOARD
            </button>
          </div>
        )}
        <div style={styles.scrollingContainer}>
          <div style={styles.scrollingText}>
            🌟 Every small effort you make today builds the success of tomorrow.
            Keep pushing, keep learning — your dreams are worth it! 🌟 Your
            journey matters. Keep striving, keep growing. Prime Academy believes
            in you! 🌟 Success is the sum of small efforts repeated every day.
            Keep pushing! 🌟 You’re not just studying — you’re building a future
            to be proud of. 🌟 Every quiz you take is one step closer to
            mastering your field! 🌟
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    minHeight: "100vh",
    padding: "20px",
    gap: "20px",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    position: "fixed",
    top: "20px",
    left: "20px",
    height: "calc(100vh - 40px)",
    overflowY: "auto",
    zIndex: 3,
  },
  sidebarTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  sidebarMessage: {
    fontSize: "16px",
    color: "#666",
    textAlign: "center",
  },
  quizList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  quizItem: {
    padding: "10px",
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  quizTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "5px",
  },
  quizDetails: {
    fontSize: "14px",
    color: "#666",
  },
  mainContent: {
    flex: 1,
    marginLeft: "270px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px",
  },
  background: {
    content: '""',
    position: "fixed",
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
  spinnerContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
  },
  messageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    padding: "20px",
    zIndex: 2,
    opacity: 0.9,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    backgroundColor: "#fff",
    position: "fixed",
    top: "50%",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translate(-50%, -50%)",
  },
  messageTitle: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
  },
  timerContainer: {
    position: "fixed",
    top: "0",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    width: "calc(90% - 270px)", // Adjusted for sidebar
    textAlign: "center",
    zIndex: 2,
    opacity: 0.9,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    padding: "5px",
    marginTop: "8px",
    backgroundColor: "#fff",
  },
  questionNumber: {
    fontSize: "30px",
    color: "black",
    marginBottom: "2px",
    fontWeight: "bold",
  },
  cont: {
    position: "fixed",
    top: "230px",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
    display: "flex",
    width: "calc(95% - 270px)", // Adjusted for sidebar
    textAlign: "center",
    zIndex: 1,
    opacity: 0.9,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    padding: "5px",
    marginTop: "8px",
    backgroundColor: "#fff",
  },
  Container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    backgroundColor: "#fff",
    padding: "5px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    width: "calc(90% - 270px)", // Adjusted for sidebar
    margin: "0 auto 30px",
    position: "fixed",
    top: "43%",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    width: "100%",
    overflowY: "auto",
    height: "270px",
  },
  questionImage: {
    width: "100%",
    height: "290px",
    objectFit: "fill",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
  },
  questionText: {
    fontSize: "1.5rem",
    fontWeight: "500",
    padding: "5px",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionButton: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    fontWeight: "600",
  },
  navigation: {
    position: "fixed",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
    bottom: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "calc(95% - 270px)", // Adjusted for sidebar
    padding: "10px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#fff",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    cursor: "pointer",
    fontSize: "30px",
    width: "98%",
    fontWeight: "800",
    position: "fixed",
    bottom: "30px",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
  },
  button1: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "30px",
    width: "95%",
    fontWeight: "800",
  },
  contain: {
    display: "flex",
    gap: "20px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "calc(90% - 270px)", // Adjusted for sidebar
    padding: "10px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    height: "55vh",
    position: "fixed",
    top: "25%",
    left: "calc(50% + 135px)", // Adjusted for sidebar
    transform: "translateX(-50%)",
  },
  title: {
    fontSize: "35px",
    textAlign: "center",
    marginBottom: "300px",
  },
  miniScoresContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "9vh",
    padding: "20px",
    boxSizing: "border-box",
  },
  miniContain: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    fontWeight: 900,
    fontSize: "100px",
    zIndex: 2,
    opacity: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    height: "25vh",
    marginBottom: "200px",
  },
  mainContainer: {
    height: "86vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollingContainer: {
    position: "fixed",
    bottom: 10,
    left: "270px", // Adjusted for sidebar
    width: "calc(100% - 270px)", // Adjusted for sidebar
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
`;

export default LiveQuiz;
