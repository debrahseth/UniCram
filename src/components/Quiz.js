import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from './courses';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaChevronLeft, FaCheck, FaTimes, FaLightbulb, FaClock } from 'react-icons/fa';
import TopLeftLogo from './TopLeftLogo'; 
import TopRightLogo from './TopRightLogo';
import logo from "../assets/main.jpg";

const Quiz = () => {
  const navigate = useNavigate();
  const firestore = db;
  const authInstance = auth;
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  const timeLimits = {
    easy: 15000,
    medium: 30000,
    hard: 450000,
  };

  const rules = [
    "Each quiz you select to attempt comes in three different difficulty levels.",
    "In these difficulty levels are different format of questions.",
    "As you can see, the difficulty levels are 'Easy', 'Medium' and 'Hard'.",
    "The 'Easy' difficulty level quiz questions are just 'True/False' statements for which you have a maximum of '2 minutes, 30 seconds' to complete.",
    "The 'Medium' difficulty level quiz questions are just 'Multiple Choice' questions for which you have a maximum of '5 minutes' to complete.",
    "The 'Hard' difficulty level quiz questions are just 'Fill-in' questions for which you have a maximum of '7 minutes, 30 seconds' to complete.",
    "Don't be scared. These are simple questions you can answer.",
    "After each quiz taken, your score is saved to your 'Personal Records' which you can access through your 'Profile Page', or the 'Leaderboard Screen'.",
    "Also, at the end of any quiz, you are graded based on your score obtained. This is shown to you at the end of the quiz.",
    "A 'Leaderboard' is also available to help you know the leaders and losers of any quiz taken.",
    "The leaderboard is just there to help you improve your scores. Don't be ashamed if you are not at the top. There's more room for improvement.",
    "I wish you a very big 'GOOD LUCK' as you take this quiz."
  ];
  const handleCourseSelection = (course) => {
    setSelectedCourse(course);
    setSelectedDifficulty(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
  };

  const handleDifficultySelection = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentQuestionIndex(0);
    setTimer(timeLimits[difficulty]);
    setTimerRunning(true);
  };

  const handleAnswer = (answer) => {
    const currentQuestion = filteredQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      console.error('No question found at current index:', currentQuestionIndex);
      return;
    }
    const newUserAnswers = [...userAnswers, { questionId: currentQuestionIndex, answer }];
    setUserAnswers(newUserAnswers);
    setUserAnswer('');
    handleNextQuestion(newUserAnswers);
  };

  const handleNextQuestion = (newUserAnswers) => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      endQuiz(newUserAnswers);
    }
  };

  const endQuiz = (newUserAnswers) => {
    const score = calculateScore(newUserAnswers);
    saveScoreToFirestore(score);
    navigate('/result', { state: { score, questions: filteredQuestions, userAnswers: newUserAnswers } });
  };

  const calculateScore = (answers) => {
    let score = 0;
    answers.forEach((answer, index) => {
      const currentQuestion = filteredQuestions[index];
      if (answer.answer === currentQuestion.answer) {
        score += 1;
      }
    });
    return score;
  };

  const saveScoreToFirestore = async (score) => {
    const totalQuestions = filteredQuestions.length;
    const currentUser = auth.currentUser;
    try {
      await addDoc(collection(firestore, 'scores'), {
        userId: authInstance.currentUser.uid,
        difficulty: selectedDifficulty,
        subject: selectedCourse.title,
        score,
        totalQuestions,
      });
      console.log('Score saved successfully!');
  const userQuizScoresRef = doc(firestore, 'users', currentUser.uid);
    const userQuizScoresCollectionRef = collection(userQuizScoresRef, 'quizScores');

    await addDoc(userQuizScoresCollectionRef, {
      difficulty: selectedDifficulty,
      subject: selectedCourse.title,
      score,
      totalQuestions,
      dateTaken: new Date(),
    });
    console.log('Score saved successfully under the user ID in the quizScores subcollection!');
  } catch (error) {
    console.error('Error saving score:', error);
  }
};

  useEffect(() => {
    if (timerRunning && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (timer === 0 && timerRunning) {
      const score = calculateScore(userAnswers);
      saveScoreToFirestore(score);
      navigate('/result', { state: { score, questions: filteredQuestions, userAnswers } });
    }
  }, [timer, timerRunning, userAnswers]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  };

  const filteredQuestions = selectedCourse && selectedDifficulty
    ? selectedCourse.questions.filter((question) => question.difficulty === selectedDifficulty)
    : [];

  if (!selectedCourse) {
    return (
      <div style={styles.mainContainer}>
        <div style={styles.background}></div>
        <div style={styles.header}>
          <h2 style={{fontSize: "40px"}}>Select a Course</h2>
        </div>
        <div style={styles.courseSelection}>
          {courses.map((course, index) => (
            <button key={index} onClick={() => handleCourseSelection(course)} style={styles.courseButton}>
              <FaLightbulb style={styles.icon} /> {course.title}
            </button>
          ))}
        </div>
        <div>
        <button onClick={() => navigate('/dashboard')} style={styles.goBackButton}>
          <FaChevronLeft style={styles.icon} /> Go Back
        </button>
      </div>
      </div>
    );
  }

  if (!selectedDifficulty) {
    const difficulties = ['easy', 'medium', 'hard'];
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={{fontSize: '36px'}}>{selectedCourse.title} Quiz</h2>
        </div>
        <div style={styles.contain}>
          <div style={styles.difficultySelection}>
          <h2 style={styles.head}> Select Difficulty for {selectedCourse.title} Quiz </h2>
          {difficulties.map((difficulty, index) => (
            <button key={index} onClick={() => handleDifficultySelection(difficulty)} style={styles.difficultyButton}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
          </div>
          <div style={styles.content}>
            <h2 style={styles.title}> Rules for the quizzes</h2>
            <div style={styles.scrollableContainer}>
              <ul style={styles.tipsList}>
                {rules.map((tip, index) => (
                <li key={index} style={styles.tipItem}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div style={styles.buttonContainer}>
          <button onClick={() => setSelectedCourse(null)} style={styles.goBackButton}>
            <FaChevronLeft style={styles.icon} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (filteredQuestions.length === 0) {
    return <div style={styles.container}>No questions available for the selected difficulty level.</div>;
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const renderQuestion = () => {
    if (!currentQuestion) {
      return <div>Loading question...</div>;
    }
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div>
            <div style={styles.cont}>
              <h3>{currentQuestion.question}</h3>
            </div>
            <div style={styles.con2}>
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)} style={styles.answerButton}>
                {option}
              </button>
            ))}
            </div>
            <div style={styles.footer}>
              <p>© 2025 StudyGroup. All rights reserved.</p>
            </div>
          </div>
        );
      case 'true-false':
        return (
          <div>
            <div style={styles.cont}>
              <h3>{currentQuestion.question}</h3>
            </div>
            <div style={styles.con1}>
            <button onClick={() => handleAnswer('True')} style={styles.button}>
              <FaCheck style={styles.icon} /> True
            </button>
            <button onClick={() => handleAnswer('False')} style={styles.button}>
              <FaTimes style={styles.icon} /> False
            </button>
            </div>
            <div style={styles.footer}>
              <p>© 2025 StudyGroup. All rights reserved.</p>
            </div>
          </div>
        );
      case 'fill-in':
        return (
          <div>
            <div style={styles.cont}>
              <h3>{currentQuestion.question}</h3>
            </div>
            <div style={styles.cont}>
            <input
              type="text"
              placeholder='Type your answer here....'
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={styles.inputField}
            />
            </div>
            <div style={styles.con2}>
            <button
              onClick={() => handleAnswer(userAnswer)}
              style={styles.submitButton}
            >
              Submit Answer
            </button>
            </div>
            <div style={styles.footer}>
              <p>© 2025 StudyGroup. All rights reserved.</p>
            </div>
          </div>
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
      <TopLeftLogo />
      <TopRightLogo />
        <h2 style={{fontSize: "40px"}}>Quiz: {selectedCourse.title}</h2>
      </div>
      <div style={styles.con}>
        <h3 style={{fontSize: "33px"}}>Question {currentQuestionIndex + 1}:</h3>
        <div style={styles.timerContainer}>
          <FaClock style={styles.icon} /> <h4 style={{fontSize: "30px"}}>Time Left: {formatTime(timer)}</h4>
        </div>
      </div>
        {renderQuestion()}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    color: '#333',
    boxSizing: 'border-box',
  },
  mainContainer: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.5,
    zIndex: -1,
  },
  header: {
    position: "fixed",
    top: 15,
    left: 0,
    width: "100%",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    zIndex: 10,
    opacity: "0.7",
  },
  courseSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    textAlign: 'center',
    width: '90%',
    marginTop: "180px",
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    opacity: "0.9",
  },
  courseButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 25px',
    fontSize: '30px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: '10px',
    fontSize: '25px',
  },
  buttonContainer: {
    width: '100%',
    position: 'fixed',
    bottom: '0',
    left: '0',
    backgroundColor: '#fff',
    padding: '10px 0',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  goBackButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    marginTop: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultySelection: {
    display: 'flex',
    gap: '20px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    padding: '10px',
    flex: 1,   
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '70vh',
    marginTop: '120px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    padding: '10px',
    marginLeft: '20px',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '70vh',
    marginTop: '120px'
  },
  con: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '140px'
  },
  cont: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '40px'
  },
  con2: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '50px'
  },
  con1: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '150px',
  },
  tipsList: {
    listStyleType: 'disc',
    paddingLeft: '25px',
    color: '#333',
    fontSize: '25px',
  },
  tipItem: {
    marginBottom: '10px',
  },
  title: {
    fontSize: '35px'
  },
  head: {
    fontSize: '35px',
    textAlign: 'center'
  },
  scrollableContainer: {
    flex: 1,      
    overflowY: 'auto',
    opacity: '0.9',
    width: '100%',
  },
  contain: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', 
    width: '100%',
    height: '100vh',
    padding: '20px',
    boxSizing: 'border-box',
  },  
  difficultyButton: {
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '15px 25px',
    fontSize: '30px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
  },
  answerButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 25px',
    fontSize: '18px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    marginBottom: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    margin: '0 10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  inputField: {
    padding: '12px',
    fontSize: '20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '90%',
    marginBottom: '20px',
    marginTop: '20px',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    padding: '15px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontFamily: 'Poppins, sans-serif',
  }
};

export default Quiz;
