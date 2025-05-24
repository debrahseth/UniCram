import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseData1 } from "../questions/courseData1";
import { courseData2 } from "../questions/courseData2";
import { courseData3 } from "../questions/courseData3";
import { courseData4 } from "../questions/courseData4";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import logo from "../assets/op.jpg";
import { dotStream } from "ldrs";

const TestYourself = () => {
  const navigate = useNavigate();
  const firestore = db;
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [stage, setStage] = useState("course");
  const [timer, setTimer] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [programOfStudy, setProgramOfStudy] = useState("");
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [semesterOfStudy, setSemesterOfStudy] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showDiagram, setShowDiagram] = useState(true);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [readAloud, setReadAloud] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showElectiveModal, setShowElectiveModal] = useState(false);
  const [selectedElectives, setSelectedElectives] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const handleZoomImage = (image) => {
    setZoomedImage(image);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProgramOfStudy(userData.programOfStudy || "");
        setLevelOfStudy(userData.levelOfStudy || "");
        setSemesterOfStudy(userData.semesterOfStudy || "");

        setSelectedElectives(userData.selectedElectives || []);
        const allCourseData = {
          ...courseData1,
          ...courseData2,
          ...courseData3,
          ...courseData4,
        };
        const matchingCourses = Object.entries(allCourseData).filter(
          ([, course]) =>
            (course.programOfStudy === userData.programOfStudy ||
              course.programOfStudy === "All Programs" ||
              (Array.isArray(course.programOfStudy) &&
                course.programOfStudy.includes(userData.programOfStudy))) &&
            course.levelOfStudy === userData.levelOfStudy &&
            course.semesterOfStudy === userData.semesterOfStudy
        );
        setAvailableCourses(matchingCourses);
        const electiveCourses = matchingCourses.filter(
          ([, course]) => course.elective
        );
        if (
          electiveCourses.length > 0 &&
          (!userData.selectedElectives ||
            userData.selectedElectives.length === 0)
        ) {
          setShowElectiveModal(true);
        }
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  const handleElectiveChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedElectives(selected);
  };

  const handleConfirmElectives = async () => {
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userDocRef, {
      selectedElectives: selectedElectives,
    });
    setShowElectiveModal(false);
  };

  const handleCloseElectiveModal = () => {
    setShowElectiveModal(false);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setStage("difficulty");
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setStage("quiz");
  };

  useEffect(() => {
    if (selectedCourse && selectedDifficulty) {
      let questionsToDisplay = [];

      const getQuestionsFromSources = (course, difficulty) => {
        let data =
          courseData1[course]?.[difficulty] ||
          courseData2[course]?.[difficulty] ||
          courseData3[course]?.[difficulty] ||
          courseData4[course]?.[difficulty];

        return data ? [...data] : [];
      };

      if (selectedDifficulty === "Random") {
        const allDifficulties = ["Easy", "Medium", "Hard"];
        allDifficulties.forEach((level) => {
          const difficultyData = getQuestionsFromSources(selectedCourse, level);
          if (difficultyData.length > 0) {
            questionsToDisplay = [...questionsToDisplay, ...difficultyData];
          }
        });
        // questionsToDisplay = questionsToDisplay.sort(() => Math.random() - 0.5);
      } else {
        questionsToDisplay = getQuestionsFromSources(
          selectedCourse,
          selectedDifficulty
        );
      }

      setQuestions(questionsToDisplay);
    }
  }, [selectedCourse, selectedDifficulty]);

  useEffect(() => {
    if (stage === "quiz") {
      const durations = {
        Easy: 2700,
        Medium: 3600,
        Hard: 5400,
        Random: 6300,
      };
      setTimer(durations[selectedDifficulty] || durations.Default);
      setTimerActive(true);
    }
  }, [stage, selectedDifficulty]);

  useEffect(() => {
    let interval;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setQuizFinished(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleSelectAnswer = (answer) => {
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleToggleMultiSelect = (option) => {
    const current = selectedAnswers[currentQuestionIndex] || [];
    const alreadySelected = current.includes(option);

    const updated = alreadySelected
      ? current.filter((o) => o !== option)
      : [...current, option];

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: updated,
    });
  };

  const handleTypeAnswer = (answer) => {
    const userAnswer = answer.trim().toLowerCase();
    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: userAnswer,
    }));
  };

  const filteredQuestions = questions.filter((q) => q.type !== "Preamble");
  const totalFilteredQuestions = filteredQuestions.length;
  const getCurrentFilteredIndex = () => {
    let questionCount = 0;
    for (let i = 0; i <= currentQuestionIndex; i++) {
      if (questions[i].type !== "Preamble") {
        questionCount++;
      }
    }
    return questionCount;
  };

  const progress =
    totalFilteredQuestions > 0
      ? (getCurrentFilteredIndex() / totalFilteredQuestions) * 100
      : 0;

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setInputValue("");
      setShowDiagram(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setInputValue("");
      setShowDiagram(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      if (question.type === "Preamble") return score;

      const rawAnswer = selectedAnswers[index];

      let userAnswer = "";
      if (typeof rawAnswer === "string") {
        userAnswer = rawAnswer.trim().toLowerCase();
      } else if (Array.isArray(rawAnswer)) {
        userAnswer = rawAnswer.map((a) => a.trim().toLowerCase());
      }
      if (question.type === "Fill-in" && Array.isArray(question.answer)) {
        const rangeAnswer = question.answer[0];
        if (rangeAnswer.includes("to")) {
          const [min, max] = rangeAnswer.split("to").map(Number);
          const userNumber = Number(userAnswer);
          if (!isNaN(userNumber) && userNumber >= min && userNumber <= max) {
            return score + 1;
          }
          return score;
        }
      }
      if (Array.isArray(question.answer)) {
        if (Array.isArray(userAnswer)) {
          const allCorrect = userAnswer.every((ua) =>
            question.answer.some((ans) => ans.trim().toLowerCase() === ua)
          );
          return score + (allCorrect ? 1 : 0);
        } else {
          const isCorrect = question.answer.some(
            (ans) => ans.trim().toLowerCase() === userAnswer
          );
          return score + (isCorrect ? 1 : 0);
        }
      } else {
        return (
          score + (userAnswer === question.answer.trim().toLowerCase() ? 1 : 0)
        );
      }
    }, 0);
  };

  const saveScoreToFirestore = async (score) => {
    const totalQuestions = filteredQuestions.length;
    const currentUser = auth.currentUser;
    const subjectName = selectedCourse;
    const userDocRef = doc(firestore, "users", currentUser.uid);
    const userQuizScoresCollectionRef = collection(userDocRef, "quizScores");
    await addDoc(userQuizScoresCollectionRef, {
      difficulty: selectedDifficulty,
      subject: subjectName,
      score,
      totalQuestions,
      dateTaken: new Date(),
    });
  };

  const handleSubmitQuiz = async () => {
    setQuizFinished(true);
    const score = calculateScore();
    await saveScoreToFirestore(score);
    speechSynthesis.cancel();
  };

  const calculatePercentage = () => {
    const score = calculateScore();
    const total = filteredQuestions.length;
    return total > 0 ? (score / total) * 100 : 0;
  };

  const getCongratulatoryMessage = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) {
      return "Excellent!";
    } else if (percentage >= 75) {
      return "Great job!";
    } else if (percentage >= 50) {
      return "Good effort!";
    } else {
      return "Better luck next time!";
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (readAloud && questions[currentQuestionIndex]?.question) {
      const utterance = new SpeechSynthesisUtterance(
        questions[currentQuestionIndex].question
      );
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    }
  }, [readAloud, currentQuestionIndex]);

  dotStream.register();

  return (
    <div>
      <div style={styles.container}>
        <div style={styles.background}></div>
        {stage === "course" && (
          <>
            <div style={styles.mainContainer}>
              <h2 style={styles.header}>Choose a Course</h2>
              <button
                style={{ ...styles.smallButton }}
                onClick={() => setShowElectiveModal(true)}
              >
                View Electives
              </button>
              <div style={styles.courseSelector}>
                {loading ? (
                  <div style={styles.noDataContainer}>
                    <p style={styles.noDataMessage}>
                      Loading courses
                      <l-dot-stream
                        size="60"
                        speed="2.5"
                        color="black"
                      ></l-dot-stream>
                    </p>
                  </div>
                ) : availableCourses.length > 0 ? (
                  availableCourses
                    .filter(
                      ([courseName, course]) =>
                        !course.elective ||
                        selectedElectives.includes(courseName)
                    )
                    .map(([course]) => (
                      <button
                        key={course}
                        style={styles.courseButton}
                        onClick={() => handleCourseSelect(course)}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.01)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        {course}
                      </button>
                    ))
                ) : (
                  <div style={styles.noDataContainer}>
                    <p style={styles.noDataMessage}>
                      No courses available for your program of study.
                    </p>
                  </div>
                )}
              </div>
              <div style={styles.buttonContainment}>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={styles.goBackButton}
                >
                  Go Back
                </button>
              </div>
            </div>
          </>
        )}
        {stage === "difficulty" && selectedCourse && (
          <>
            <div style={styles.parentContainer}>
              <h2 style={styles.header}>
                Choose Duration for {selectedCourse} Quiz
              </h2>
              <div style={styles.difficultySelector}>
                <button
                  onClick={() => handleDifficultySelect("Easy")}
                  style={styles.courseButton}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  45 minutes
                </button>
                <button
                  onClick={() => handleDifficultySelect("Medium")}
                  style={styles.courseButton}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  1 hour
                </button>
                <button
                  onClick={() => handleDifficultySelect("Hard")}
                  style={styles.courseButton}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  1 hour - 30 minutes
                </button>
                <button
                  onClick={() => handleDifficultySelect("Random")}
                  style={styles.courseButton}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.01)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  1 hour - 45 minutes
                </button>
              </div>
              <div style={styles.buttonContainment}>
                <button
                  onClick={() => navigate("/dashboard")}
                  style={styles.goBackButton}
                >
                  Go Back
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      {stage === "quiz" && totalFilteredQuestions > 0 && !quizFinished && (
        <>
          <div style={styles.container}>
            <div style={styles.background}></div>
            <div style={styles.timerContainer}>
              <p style={styles.questionNumber}>{selectedCourse} Quiz</p>
              <p style={styles.questionNumber}>
                Time Left: {Math.floor(timer / 3600)}hr :{" "}
                {String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}mins :{" "}
                {String(timer % 60).padStart(2, "0")}s
              </p>
              <p style={styles.questionNumber}>
                {questions[currentQuestionIndex]?.type === "Preamble"
                  ? "Preamble"
                  : `Question ${getCurrentFilteredIndex()} / ${totalFilteredQuestions}`}
              </p>
              <div style={styles.progressBar}>
                <div
                  style={{ ...styles.progressFill, width: `${progress}%` }}
                />
              </div>
              <div style={styles.readingControlsContainer}>
                {!readAloud ? (
                  <button
                    style={styles.toggleButton1}
                    onClick={() => {
                      setReadAloud(true);
                      setIsPaused(false);
                    }}
                  >
                    🔊
                  </button>
                ) : (
                  <>
                    <button
                      style={styles.toggleButton1}
                      onClick={() => {
                        if (isPaused) {
                          window.speechSynthesis.resume();
                          setIsPaused(false);
                        } else {
                          window.speechSynthesis.pause();
                          setIsPaused(true);
                        }
                      }}
                    >
                      {isPaused ? "▶️" : "⏸️"}
                    </button>
                    <button
                      style={{
                        ...styles.toggleButton1,
                        backgroundColor: "#dc3545",
                      }}
                      onClick={() => {
                        window.speechSynthesis.cancel();
                        setReadAloud(false);
                        setIsPaused(false);
                      }}
                    >
                      🛑
                    </button>
                  </>
                )}
              </div>
            </div>
            <div style={styles.cont}>
              {questions[currentQuestionIndex].type === "Preamble" ? (
                <p style={styles.question}>
                  <strong>Preamble:</strong>{" "}
                  {questions[currentQuestionIndex].question}
                </p>
              ) : (
                <p style={styles.question}>
                  Question {getCurrentFilteredIndex()}:{" "}
                  {questions[currentQuestionIndex].question}
                </p>
              )}
            </div>
            <div style={styles.optionsContainer}>
              {questions[currentQuestionIndex].type === "Preamble" ? (
                <div style={styles.preambleContainer}>
                  {Array.isArray(questions[currentQuestionIndex].text) ? (
                    questions[currentQuestionIndex].text.map((item, index) =>
                      item.startsWith("http") ||
                      item.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                        <img
                          key={index}
                          src={item}
                          alt={`Preamble Diagram ${index + 1}`}
                          style={styles.diagramImage}
                        />
                      ) : (
                        <p key={index} style={{ width: "50%" }}>
                          {item}
                        </p>
                      )
                    )
                  ) : questions[currentQuestionIndex].text &&
                    (questions[currentQuestionIndex].text.startsWith("http") ||
                      questions[currentQuestionIndex].text.match(
                        /\.(jpeg|jpg|gif|png|webp|svg)$/i
                      )) ? (
                    <img
                      src={questions[currentQuestionIndex].text}
                      alt="Preamble Diagram"
                      style={styles.diagramImage}
                    />
                  ) : (
                    <p>{questions[currentQuestionIndex].text}</p>
                  )}
                </div>
              ) : (
                <>
                  {questions[currentQuestionIndex].image && (
                    <button
                      style={styles.toggleButton}
                      onClick={() => setShowDiagram(!showDiagram)}
                    >
                      {showDiagram ? "Hide Diagram" : "Show Diagram"}
                    </button>
                  )}
                  {questions[currentQuestionIndex].image && showDiagram && (
                    <img
                      src={questions[currentQuestionIndex].image}
                      alt="Question Diagram"
                      style={styles.diagramImage}
                      onClick={() =>
                        handleZoomImage(questions[currentQuestionIndex].image)
                      }
                    />
                  )}
                  {questions[currentQuestionIndex].type === "Multiple Choice" ||
                  questions[currentQuestionIndex].type ===
                    "Multiple Answers" ? (
                    questions[currentQuestionIndex].options.map(
                      (option, index) => {
                        const isMultiple =
                          questions[currentQuestionIndex].type ===
                          "Multiple Answers";
                        const isSelected = isMultiple
                          ? selectedAnswers[currentQuestionIndex]?.includes(
                              option
                            )
                          : selectedAnswers[currentQuestionIndex] === option;
                        return (
                          <button
                            key={index}
                            style={{
                              ...styles.optionButton,
                              backgroundColor: isSelected
                                ? "#4CAF50"
                                : "#f0f0f0",
                            }}
                            onClick={() =>
                              isMultiple
                                ? handleToggleMultiSelect(option)
                                : handleSelectAnswer(option)
                            }
                          >
                            {option}
                          </button>
                        );
                      }
                    )
                  ) : questions[currentQuestionIndex].type === "True/False" ? (
                    <>
                      <button
                        style={{
                          ...styles.optionButton,
                          backgroundColor:
                            selectedAnswers[currentQuestionIndex] === "True"
                              ? "#4CAF50"
                              : "#f0f0f0",
                        }}
                        onClick={() => handleSelectAnswer("True")}
                      >
                        True
                      </button>
                      <button
                        style={{
                          ...styles.optionButton,
                          backgroundColor:
                            selectedAnswers[currentQuestionIndex] === "False"
                              ? "#4CAF50"
                              : "#f0f0f0",
                        }}
                        onClick={() => handleSelectAnswer("False")}
                      >
                        False
                      </button>
                    </>
                  ) : questions[currentQuestionIndex].type === "Diagram" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Type your answer"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={(e) => {
                          handleTypeAnswer(e.target.value.trim().toLowerCase());
                          setInputValue("");
                        }}
                        style={styles.inputField1}
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      placeholder="Type your answer"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={(e) => {
                        handleTypeAnswer(e.target.value.trim().toLowerCase());
                        setInputValue("");
                      }}
                      style={styles.inputField}
                    />
                  )}
                  {zoomedImage && (
                    <div
                      style={styles.modalOverlay}
                      onClick={() => setZoomedImage(null)}
                    >
                      <img
                        src={zoomedImage}
                        alt="Zoomed Diagram"
                        style={styles.zoomedImage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            <div style={styles.navigation}>
              {currentQuestionIndex > 0 && (
                <button
                  style={styles.prevButton}
                  onClick={handlePreviousQuestion}
                >
                  Previous Question
                </button>
              )}
              {currentQuestionIndex < questions.length - 1 ? (
                <button style={styles.nextButton} onClick={handleNextQuestion}>
                  Next Question
                </button>
              ) : (
                <button style={styles.submitButton} onClick={handleSubmitQuiz}>
                  Submit Quiz
                </button>
              )}
            </div>
          </div>
        </>
      )}
      {quizFinished && (
        <div style={styles.container}>
          <div style={styles.headContainer}>
            <div style={styles.head}>
              <h2 style={{ fontSize: "50px" }}> Quiz Results</h2>
              <p style={styles.congratulatoryMessage}>
                {getCongratulatoryMessage()}
              </p>
            </div>
          </div>
          <div style={styles.scoresContainer}>
            <div style={styles.contain}>
              <div style={styles.mainContainer}>
                <h2 style={styles.title}>Your Score</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {calculateScore()} / {filteredQuestions.length}
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.contain}>
              <div style={styles.mainContainer}>
                <h2 style={styles.title}>Percentage</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {Math.floor(calculatePercentage())}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={styles.buttonContainer}>
            <button
              style={styles.reviewButton}
              onClick={() =>
                navigate("/review", { state: { selectedAnswers, questions } })
              }
            >
              Review Quiz
            </button>
            <button
              style={styles.restartButton}
              onClick={() => navigate("/dashboard")}
            >
              Go Home
            </button>
          </div>
        </div>
      )}
      {showElectiveModal && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.modal}>
            <h3 style={modalStyles.title}>SELECT YOUR ELECTIVES</h3>
            <p style={modalStyles.text}>
              Please select the elective courses you are taking for{" "}
              {programOfStudy}, {levelOfStudy}, {semesterOfStudy}.
            </p>
            <select
              multiple
              value={selectedElectives}
              onChange={handleElectiveChange}
              style={modalStyles.select}
            >
              {availableCourses
                .filter(([, course]) => course.elective)
                .map(([courseName]) => (
                  <option key={courseName} value={courseName}>
                    {courseName}
                  </option>
                ))}
            </select>
            <p style={modalStyles.hint}>
              Hold Ctrl/Cmd to select multiple electives
            </p>
            <div style={modalStyles.buttonContainer}>
              <button
                onClick={handleConfirmElectives}
                style={modalStyles.acceptButton}
              >
                Confirm
              </button>
              <button
                onClick={handleCloseElectiveModal}
                style={modalStyles.closeButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  noDataContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
    width: "80%",
    minHeight: "200px",
    position: "absolute",
    top: "60%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  noDataMessage: {
    fontSize: "50px",
    color: "#000000",
    fontWeight: "900",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Poppins, sans-serif",
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
    opacity: 0.2,
    zIndex: -1,
  },
  header: {
    position: "fixed",
    top: "0px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.8)",
    color: "black",
    fontSize: "40px",
    padding: "20px",
    textAlign: "center",
    zIndex: 1,
    opacity: 0.7,
    borderRadius: "30px",
    marginLeft: "auto",
    marginRight: "auto",
    textTransform: "uppercase",
  },
  courseSelector: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    textAlign: "center",
    width: "90%",
    marginTop: "200px",
    flex: 1,
    overflowY: "auto",
    padding: "15px",
    opacity: "0.9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
  },
  parentContainer: {
    height: "83vh",
    width: "90vw",
    display: "flex",
    justifyContent: "center",
  },
  difficultySelector: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "50px",
    textAlign: "center",
    marginTop: "160px",
    padding: "20px",
    opacity: "0.9",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  courseButton: {
    backgroundColor: "#4CAF50",
    opacity: "0.9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    color: "white",
    padding: "15px 25px",
    fontSize: "40px",
    fontWeight: "900",
    cursor: "pointer",
    border: "none",
    transition: "transform 0.3s ease, background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  optionButton: {
    backgroundColor: "#4CAF50",
    color: "black",
    padding: "15px 25px",
    fontSize: "25px",
    fontWeight: "bolder",
    cursor: "pointer",
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quizContainer: {
    width: "100%",
    maxWidth: "600px",
    textAlign: "center",
  },
  question: {
    fontSize: "1.5rem",
    fontWeight: "900",
    padding: "5px",
  },
  optionsContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 1,
    opacity: 0.9,
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "8px",
    width: "80%",
    marginTop: "35px",
    overflowY: "auto",
    maxHeight: "250px",
  },
  progressBar: {
    width: "100%",
    height: "20px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    marginBottom: "6px",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "gold",
    borderRadius: "10px",
  },
  questionNumber: {
    fontSize: "30px",
    color: "black",
    marginBottom: "2px",
    fontWeight: "bold",
  },
  congratulatoryMessage: {
    fontSize: "35px",
    color: "black",
    marginTop: "20px",
    fontWeight: "bold",
    textAlign: "center",
  },
  navigation: {
    position: "fixed",
    bottom: "10px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    padding: "10px",
    textAlign: "center",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    marginLeft: "auto",
    marginRight: "auto",
    gap: "10px",
  },
  nextButton: {
    flex: 1,
    padding: "15px 30px",
    fontSize: "1.2rem",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  prevButton: {
    flex: 1,
    padding: "15px 30px",
    fontSize: "1.2rem",
    backgroundColor: "red",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  submitButton: {
    flex: 1,
    padding: "15px 30px",
    fontSize: "1.2rem",
    backgroundColor: "green",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "90%",
  },
  buttonContainment: {
    width: "100%",
    position: "fixed",
    bottom: "0",
    left: "0",
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  goBackButton: {
    backgroundColor: "#2196F3",
    color: "white",
    padding: "12px 20px",
    fontSize: "30px",
    cursor: "pointer",
    borderRadius: "10px",
    border: "none",
    marginTop: "20px",
    width: "80%",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewButton: {
    padding: "15px 30px",
    fontSize: "2.0rem",
    backgroundColor: "#FFC107",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "45%",
  },
  resultText: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "20px",
  },
  restartButton: {
    padding: "15px 30px",
    fontSize: "2.0rem",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    width: "45%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    position: "fixed",
    bottom: "0",
    left: "0",
    backgroundColor: "#fff",
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
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
  icon: {
    marginRight: "10px",
    fontSize: "25px",
  },
  inputField: {
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },
  inputField1: {
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "25px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "80%",
    marginTop: "10px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  mainContainer: {
    height: "83vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scoresContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    height: "50vh",
    padding: "5px",
    boxSizing: "border-box",
    marginTop: "150px",
  },
  contain: {
    display: "flex",
    gap: "20px",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    padding: "10px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    height: "50vh",
    marginTop: "100px",
    marginLeft: "10px",
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
  headContainer: {
    display: "flex",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    width: "96%",
    position: "fixed",
    top: 20,
    flexDirection: "row",
  },
  head: {
    textAlign: "center",
    flex: 1,
    justifyContent: "center",
  },
  cont: {
    position: "fixed",
    top: "250px",
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
    overflowY: "auto",
    maxHeight: "180px",
  },
  toggleButton: {
    padding: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
  diagramImage: {
    width: "650px",
    height: "110%",
    cursor: "pointer",
    display: "block",
    margin: "0 auto",
    borderRadius: "10px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    maxWidth: "80%",
    maxHeight: "80%",
  },
  readingControlsContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    display: "flex",
    gap: "10px",
    zIndex: 1000,
  },
  toggleButton1: {
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "20px",
    transition: "0.3s ease",
  },
  preambleContainer: {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
    padding: "20px",
    borderRadius: "8px",
    fontSize: "1.3rem",
    color: "#333",
    textAlign: "justify",
    lineHeight: "1.6",
    height: "250px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    gap: 10,
  },
  smallButton: {
    padding: "6px 12px",
    backgroundColor: "transparent",
    fontSize: "1.2rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.8)",
    position: "fixed",
    top: "16.5%",
    width: "100%",
    maxWidth: "500px",
    textTransform: "uppercase",
    border: "none",
    fontWeight: "800",
  },
};
const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "600px",
    maxWidth: "90%",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  title: {
    fontSize: "30px",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  text: {
    fontSize: "25px",
    marginBottom: "15px",
    color: "#555",
  },
  select: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "3px solid #ccc",
    minHeight: "150px",
    fontSize: "20px",
    textAlign: "center",
  },
  hint: {
    fontSize: "15px",
    color: "#666",
    marginBottom: "15px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    width: "45%",
  },
  closeButton: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    width: "45%",
  },
};
export default TestYourself;
