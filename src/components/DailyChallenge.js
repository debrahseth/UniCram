import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { dotStream } from "ldrs";
import questionsData from "../questions/questions.json";
import logo from "../assets/op.jpg";

const DailyChallenge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { levelOfStudy, programOfStudy, semesterOfStudy } =
    location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasTakenToday, setHasTakenToday] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  dotStream.register();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        console.log("No authenticated user");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (
        !auth.currentUser ||
        !levelOfStudy ||
        !programOfStudy ||
        !semesterOfStudy
      ) {
        setLoading(false);
        return;
      }

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfToday = Timestamp.fromDate(today);
        const quizQuery = query(
          collection(db, "dailyQuizzes"),
          where("userId", "==", auth.currentUser.uid),
          where("programOfStudy", "==", programOfStudy),
          where("levelOfStudy", "==", levelOfStudy),
          where("semesterOfStudy", "==", semesterOfStudy),
          where("timestamp", ">=", startOfToday)
        );
        const quizSnapshot = await getDocs(quizQuery);
        if (!quizSnapshot.empty) {
          setHasTakenToday(true);
          const course = quizSnapshot.docs[0].data().course || "Unknown Course";
          navigate("/dashboard", {
            state: {
              message: `You have already taken today's ${course} quiz.`,
            },
          });
          setLoading(false);
          return;
        }
        const filteredQuestions = questionsData.filter(
          (q) =>
            q.levelOfStudy === levelOfStudy &&
            q.programOfStudy === programOfStudy &&
            q.semesterOfStudy === semesterOfStudy
        );
        const courses = [...new Set(filteredQuestions.map((q) => q.course))];
        if (courses.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }
        const dayIndex = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
        const courseIndex = dayIndex % courses.length;
        const selectedCourse = courses[courseIndex];
        const courseQuestions = filteredQuestions.filter(
          (q) => q.course === selectedCourse
        );
        const shuffledQuestions = courseQuestions
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);

        setSelectedCourse(selectedCourse);
        setQuestions(shuffledQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    if (levelOfStudy && programOfStudy && semesterOfStudy && auth.currentUser) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [levelOfStudy, programOfStudy, semesterOfStudy, navigate]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (submitting || !user) {
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
      if (!auth.currentUser) {
        console.error("No authenticated user");
        setSubmitting(false);
        return;
      }
      console.log("Authenticated user ID:", auth.currentUser.uid);
      if (
        !levelOfStudy ||
        !programOfStudy ||
        !semesterOfStudy ||
        !selectedCourse
      ) {
        console.error("Missing required fields for quiz submission");
        setSubmitting(false);
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const q = query(
        collection(db, "dailyQuizzes"),
        where("userId", "==", auth.currentUser.uid),
        where("programOfStudy", "==", programOfStudy),
        where("levelOfStudy", "==", levelOfStudy),
        where("semesterOfStudy", "==", semesterOfStudy),
        where("timestamp", ">=", Timestamp.fromDate(today))
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
          course: selectedCourse,
        });
      } else {
        await addDoc(collection(db, "dailyQuizzes"), {
          userId: auth.currentUser.uid,
          timestamp: Timestamp.fromDate(new Date()),
          score: newScore,
          totalQuestions: questions.length,
          levelOfStudy,
          programOfStudy,
          semesterOfStudy,
          course: selectedCourse,
        });
      }

      setScore(newScore);
      setQuizCompleted(true);
      setSubmitting(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const totalScore = questions.length * 10;

  if (loading) {
    return (
      <div style={styles.spinnerContainer}>
        <div style={styles.background}></div>
        <p style={{ fontSize: "36px", color: "blue" }}>
          Loading{" "}
          <l-dot-stream size="60" speed="2.5" color="blue"></l-dot-stream>
        </p>
      </div>
    );
  }

  if (hasTakenToday) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <h2>You have already taken today's {selectedCourse || "quiz"}.</h2>
        <button onClick={handleBackToDashboard} style={styles.button}>
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <h2>No questions available for your study level.</h2>
        <div style={styles.navigation}>
          <button onClick={handleBackToDashboard} style={styles.button}>
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <div style={styles.timerContainer}>
          <h2 style={{ fontSize: "50px" }}>Quiz Completed!</h2>
        </div>
        <div style={styles.contain}>
          <div style={styles.mainContainer}>
            <h2 style={styles.title}>YOUR SCORE</h2>
            <div style={styles.miniScoresContainer}>
              <div style={styles.miniContain}>
                {score} / {totalScore}
              </div>
            </div>
          </div>
        </div>
        <div style={styles.navigation}>
          <button onClick={handleBackToDashboard} style={styles.button}>
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.container}>
      <div style={styles.timerContainer}>
        <p style={styles.questionNumber}>DAILY CHALLENGE - {selectedCourse}</p>
        <p style={styles.questionNumber}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>
      <div style={styles.cont}>
        <p style={styles.questionText}>
          Question {currentQuestionIndex + 1}: {currentQuestion.question}
        </p>
      </div>
      <div style={styles.scroll}>
        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt="Question illustration"
            style={styles.questionImage}
          />
        )}
        <div style={styles.questionCard}>
          <div style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                style={{
                  ...styles.optionButton,
                  backgroundColor:
                    selectedAnswer === option ? "#007bff" : "#f8f9fa",
                  color: selectedAnswer === option ? "#fff" : "#333",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={styles.navigation}>
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null}
          style={{
            ...styles.button,
            opacity: selectedAnswer === null ? 0.5 : 1,
            cursor: selectedAnswer === null ? "not-allowed" : "pointer",
          }}
        >
          {submitting
            ? currentQuestionIndex + 1 === questions.length
              ? "Submitting... Please wait"
              : "Loading..."
            : currentQuestionIndex + 1 === questions.length
            ? "FINISH"
            : "NEXT"}
        </button>
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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    minHeight: "100vh",
  },
  title: {
    fontSize: "35px",
    textAlign: "center",
    marginBottom: "300px",
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
  timerContainer: {
    position: "fixed",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    width: "95%",
    textAlign: "center",
    zIndex: 2,
    opacity: 0.9,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    padding: "5px",
    marginTop: "8px",
  },
  questionNumber: {
    fontSize: "30px",
    color: "black",
    marginBottom: "2px",
    fontWeight: "bold",
  },
  cont: {
    position: "fixed",
    top: "180px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    width: "95%",
    textAlign: "center",
    zIndex: 1,
    opacity: 0.9,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    padding: "5px",
    marginTop: "8px",
  },
  questionCard: {
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
    width: "100%",
    maxWidth: "650px",
    marginBottom: "20px",
    overflowY: "auto",
    height: "310px",
  },
  questionImage: {
    maxWidth: "650px",
    width: "100%",
    height: "330px",
    objectFit: "fill",
    marginBottom: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
  },
  scroll: {
    height: "330px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    position: "fixed",
    width: "90%",
    top: "38%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: "1rem",
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
    bottom: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    padding: "10px",
    zIndex: 2,
    opacity: "0.9",
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    marginLeft: "auto",
    marginRight: "auto",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    width: "90%",
  },
  contain: {
    display: "flex",
    gap: "20px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    padding: "10px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    height: "55vh",
    position: "fixed",
    top: "25%",
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

export default DailyChallenge;
