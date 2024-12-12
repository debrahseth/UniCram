import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courses } from './courses';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { FaChevronLeft, FaCheck, FaTimes, FaLightbulb, FaClock } from 'react-icons/fa';
import TopLeftLogo from './TopLeftLogo'; 
import TopRightLogo from './TopRightLogo';

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
    easy: 150,
    medium: 300,
    hard: 450,
  };

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
    try {
      await addDoc(collection(firestore, 'scores'), {
        userId: authInstance.currentUser.uid,
        difficulty: selectedDifficulty,
        subject: selectedCourse.title,
        score,
        totalQuestions,
      });
      console.log('Score saved successfully!');
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
      <div style={styles.container}>
        <TopLeftLogo />
        <TopRightLogo />
        <h2>Select a Course</h2>
        <div style={styles.courseSelection}>
          {courses.map((course, index) => (
            <button key={index} onClick={() => handleCourseSelection(course)} style={styles.courseButton}>
              <FaLightbulb style={styles.icon} /> {course.title}
            </button>
          ))}
        </div>
        <div style={styles.buttonContainer}>
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
        <TopLeftLogo />
        <TopRightLogo />
        <h2>Select Difficulty Level for {selectedCourse.title}</h2>
        <div style={styles.difficultySelection}>
          {difficulties.map((difficulty, index) => (
            <button key={index} onClick={() => handleDifficultySelection(difficulty)} style={styles.difficultyButton}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </button>
          ))}
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
            <h3>{currentQuestion.question}</h3>
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)} style={styles.answerButton}>
                {option}
              </button>
            ))}
          </div>
        );
      case 'true-false':
        return (
          <div>
            <h3>{currentQuestion.question}</h3>
            <button onClick={() => handleAnswer('True')} style={styles.answerButton}>
              <FaCheck style={styles.icon} /> True
            </button>
            <button onClick={() => handleAnswer('False')} style={styles.answerButton}>
              <FaTimes style={styles.icon} /> False
            </button>
          </div>
        );
      case 'fill-in':
        return (
          <div>
            <h3>{currentQuestion.question}</h3>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              style={styles.inputField}
            />
            <button
              onClick={() => handleAnswer(userAnswer)}
              style={styles.submitButton}
            >
              Submit Answer
            </button>
          </div>
        );
      default:
        return <div>Unknown question type</div>;
    }
  };

  return (
    <div style={styles.container}>
      <TopLeftLogo />
      <TopRightLogo />
      <h2>Quiz: {selectedCourse.title}</h2>
      <h3>Question {currentQuestionIndex + 1}:</h3>
      <div style={styles.timerContainer}>
        <FaClock style={styles.icon} /> <h4>Time Left: {formatTime(timer)}</h4>
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
    height: '100vh',
    backgroundColor: '#fafafa',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    color: '#333',
    boxSizing: 'border-box',
  },
  courseSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    width: '100%',
  },
  courseButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 25px',
    fontSize: '18px',
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
    fontSize: '20px',
  },
  buttonContainer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
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
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultySelection: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
  },
  difficultyButton: {
    backgroundColor: '#FF9800',
    color: 'white',
    padding: '15px 25px',
    fontSize: '18px',
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
  },
  inputField: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '100%',
    maxWidth: '450px',
    marginBottom: '20px',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    marginBottom: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export default Quiz;
