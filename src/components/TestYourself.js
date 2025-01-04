import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseData1 } from './courseData1';
import logo from "../assets/main.jpg";

const TestYourself = () => {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [stage, setStage] = useState('course');
  const [timer, setTimer] = useState('');
  const [timerActive, setTimerActive] = useState(false);
  
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setStage('difficulty');
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setStage('quiz');
  };

  useEffect(() => {
    if (selectedCourse && selectedDifficulty) {
      let questionsToDisplay = [];
      if (selectedDifficulty === 'Random') {
        const allDifficulties = ['Easy', 'Medium', 'Hard'];
        allDifficulties.forEach((level) => {
          const difficultyData = courseData1[selectedCourse]?.[level];
          if (difficultyData) {
            questionsToDisplay = [...questionsToDisplay, ...difficultyData];
          } else {
            console.warn(`Difficulty data not found for ${level}`);
          }
        });
        questionsToDisplay = questionsToDisplay.sort(() => Math.random() - 0.5);
      } else {
        const difficultyData = courseData1[selectedCourse]?.[selectedDifficulty];
        if (difficultyData) {
          questionsToDisplay = difficultyData;
        } else {
          console.warn('Difficulty data not found');
        }
      }
      setQuestions(questionsToDisplay);
    }
  }, [selectedCourse, selectedDifficulty]);
  
  useEffect(() => {
    if (stage === 'quiz') {
      let duration = 0;
      switch (selectedDifficulty) {
        case 'Easy':
          duration = 300;
          break;
        case 'Medium':
          duration = 600;
          break;
        case 'Hard':
          duration = 900;
          break;
        case 'Random':
          duration = 1500;
          break;
        default:
          duration = 300;
      }
      setTimer(duration);
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizFinished(true);
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.answer ? 1 : 0);
    }, 0);
  };

  const calculatePercentage = () => {
    const score = calculateScore();
    return (score / questions.length) * 100;
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

  const progress = (currentQuestionIndex + 1) / questions.length * 100;

  return (
    <div>
        {stage === 'course' && (
          <>
            <h2 style={styles.header}>Choose a Course</h2>
            <div style={styles.scrollableContainer}>
            <div style={styles.courseSelector}>
              {Object.keys(courseData1).map((course) => (
                <button
                  key={course}
                  style={styles.courseButton}
                  onClick={() => handleCourseSelect(course)}
                >
                  {course}
                </button>
              ))}
            </div>
            </div>
            <div style={styles.buttonContainment}>
              <button onClick={() => navigate('/dashboard')} style={styles.goBackButton}>
                Go Back
              </button>
            </div>
          </>
        )}
        {stage === 'difficulty' && selectedCourse && (
          <>
            <h2 style={styles.header}>Choose Duration for {selectedCourse} Quiz</h2>
            <div style={styles.difficultySelector}>
              <button onClick={() => handleDifficultySelect('Easy')} style={styles.courseButton}>5 minutes</button>
              <button onClick={() => handleDifficultySelect('Medium')} style={styles.courseButton}>10 minutes</button>
              <button onClick={() => handleDifficultySelect('Hard')} style={styles.courseButton}>15 minutes</button>
              <button onClick={() => handleDifficultySelect('Random')} style={styles.courseButton}>45 minutes</button>
            </div>
            <div style={styles.buttonContainment}>
              <button onClick={() => navigate('/dashboard')} style={styles.goBackButton}>
                Go Back
              </button>
            </div>
          </>
        )}  
      {stage === 'quiz' && questions.length > 0 && !quizFinished && (
        <> 
      <div style={styles.container}>
          <div style={styles.background}></div>
          < div style={styles.timerContainer}>
              <p style={styles.questionNumber}>{selectedCourse} - {selectedDifficulty} Quiz</p>
              <p style={styles.questionNumber}>Time Left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
              <p style={styles.questionNumber}>Question {currentQuestionIndex + 1} / {questions.length}</p>
              <div style={styles.progressBar}>
                  <div style={{...styles.progressFill,width: `${progress}%`,}}/>
              </div>
          </div>
          <div style={styles.cont}>
          <p style={styles.question}>Question {currentQuestionIndex + 1}: {questions[currentQuestionIndex].question}</p>
          </div>
          <div style={styles.optionsContainer}>
            {questions[currentQuestionIndex].type === 'Multiple Choice' ? (
              questions[currentQuestionIndex].options.map((option, index) => (
                <button key={index} style={{...styles.optionButton,backgroundColor:selectedAnswers[currentQuestionIndex] === option? '#4CAF50': '#f0f0f0',}}onClick={() => handleSelectAnswer(option)}>
                  {option}
                </button>
              ))
            ) : questions[currentQuestionIndex].type === 'True/False' ? (
              <>
              <div style={styles.Container}>
                <button style={{...styles.optionButton,backgroundColor:selectedAnswers[currentQuestionIndex] === 'True'? '#4CAF50':'#f0f0f0',}}onClick={() => handleSelectAnswer('True')}>
                  True
                </button>
                <button style={{...styles.optionButton,backgroundColor:selectedAnswers[currentQuestionIndex] === 'False'? '#4CAF50': '#f0f0f0',}}onClick={() => handleSelectAnswer('False')}>
                  False
                </button>
              </div>  
              </>
            ) : (
              <input
                type="text"
                placeholder="Type your answer"
                onBlur={(e) => handleSelectAnswer(e.target.value)}
                style={styles.inputField}/>
            )}
          </div>
      </div>
        <div style={styles.navigation}>
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

            </>
          )}     

      {quizFinished && (
      <div style={styles.container}>
        <div style={styles.headContainer}>
          <div style={styles.head}>
            <h2 style={{fontSize: '50px'}}> Quiz Results</h2>
            <p style={styles.congratulatoryMessage}>{getCongratulatoryMessage()}</p>
          </div>
        </div>
        <div style={styles.scoresContainer}>
          <div style={styles.contain}>
            <div style={styles.mainContainer}>
              <div style={styles.background}></div>
              <h2 style={styles.title}>Your Score</h2> 
              <div style={styles.miniScoresContainer}>
                <div style={styles.miniContain}>
                  {calculateScore()} / {questions.length}
                </div>
              </div>   
            </div>
          </div> 
          <div style={styles.contain}>
            <div style={styles.mainContainer}>
              <div style={styles.background}></div> 
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
          <button style={styles.reviewButton} onClick={() => navigate('/review', { state: { selectedAnswers, questions } })}>
            Review Quiz
          </button>
          <button style={styles.restartButton} onClick={() => navigate('/dashboard')}>
            Go Home
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

const styles = {
container: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '85vh',
  fontFamily: 'Poppins, sans-serif',
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
  position: 'fixed',
  top: '15px',
  left: '50%',
  transform: 'translateX(-50%)', 
  width: '90%',
  backgroundColor: '#4CAF50',
  color: 'white',
  fontSize: '50px',
  padding: '20px',
  textAlign: 'center',
  zIndex: 10, 
  opacity: 0.7,
  borderRadius: '30px', 
  marginLeft: 'auto',
  marginRight: 'auto',
},
courseSelector: {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  textAlign: 'center',
  flex: 1,
  padding: "20px",
  opacity: "0.9"
},
scrollableContainer: {
  flex: 1,     
  marginTop: '180px',    
  marginBottom: '100px',
  overflowY: 'auto',
  opacity: '0.9',
  width: '90%',
  height: '60vh',
  marginRight: 'auto',
  marginLeft: 'auto'
},
difficultySelector: {
  display: 'flex',
  flexDirection: 'column',
  marginTop: "230px",
  gap: '50px',
  textAlign: 'center',
  width: '90%',
  flex: 1,
  padding: "20px",
  opacity: "0.9",
  marginRight: 'auto',
  marginLeft: 'auto',
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
optionButton: {
  backgroundColor: '#4CAF50',
  color: 'black',
  padding: '15px 25px',
  fontSize: '15px',
  fontWeight: 'bolder',
  cursor: 'pointer',
  borderRadius: '10px',
  border: 'none',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
quizContainer: {
  width: '100%',
  maxWidth: '600px',
  textAlign: 'center',
},
question: {
  fontSize: '1.5rem',
  padding: '5px'
},
optionsContainer: {
  position: 'fixed',
  top: '380px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  zIndex: 1,
  opacity: 0.9,
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  padding: '8px',
  width: '80%'
},  
Container: {
  position: 'fixed',
  top: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 1,
  opacity: 0.9,
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  padding: '8px',
  width: '80%'
},
progressBar: {
  width: '100%',
  height: '20px',
  backgroundColor: '#e0e0e0',
  borderRadius: '10px',
  marginBottom: '6px',
},
progressFill: {
  height: '100%',
  backgroundColor: '#4CAF50',
  borderRadius: '10px',
},
questionNumber: {
  fontSize: '30px',
  color: 'black',
  marginBottom: '2px',
  fontWeight: 'bold',
},
congratulatoryMessage: {
  fontSize: '35px',
  color: 'black',
  marginTop: '20px',
  fontWeight: 'bold',
  textAlign: 'center',
},
navigation: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center', 
  width: '90%',
  padding: '10px',
  textAlign: 'center',
  zIndex: 2,
  opacity: 0.9,
  flex: 1,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  marginLeft: "auto",
  marginRight: "auto",
},
nextButton: {
  padding: '15px 30px',
  fontSize: '1.2rem',
  backgroundColor: '#2196F3',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  width: '90%'
},
submitButton: {
  padding: '15px 30px',
  fontSize: '1.2rem',
  backgroundColor: '#FF5722',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  width: '90%'
},
buttonContainment: {
  width: '100%',
  position: 'fixed',
  bottom: '0',
  left: '0',
  boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
},
goBackButton: {
  backgroundColor: '#2196F3',
  color: 'white',
  padding: '12px 20px',
  fontSize: '30px',
  cursor: 'pointer',
  borderRadius: '10px',
  border: 'none',
  marginTop: '20px',
  width: '80%',
  marginBottom: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
reviewButton: {
  padding: '15px 30px',
  fontSize: '2.0rem',
  backgroundColor: '#FFC107',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  width: '45%'
},
resultText: {
  fontSize: '1.5rem',
  color: '#333',
  marginBottom: '20px',
},
restartButton: {
  padding: '15px 30px',
  fontSize: '2.0rem',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  width: '45%'
},
buttonContainer: {
  display: 'flex',
  justifyContent: 'space-evenly', 
  alignItems: 'center',    
  width: '100%',        
  padding:'20px',
  position: 'fixed',
  bottom: '0',
  left: '0',
  backgroundColor: '#fff',
  boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',  
},
timerContainer: {
  position: 'fixed',
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '95%',
  textAlign: 'center',
  zIndex: 2,
  opacity: 0.9,
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  padding: '5px',
  marginTop: '8px'
},  
icon: {
  marginRight: '10px',
  fontSize: '25px',
},
inputField: {
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '25px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  width: '80%',
  marginTop: '150px',
  marginLeft: "auto",
  marginRight: "auto",
},
mainContainer: {
  height: "60vh",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "hidden",
  width: "100%",
  alignItems: 'center',
  justifyContent: 'center',
},
scoresContainer:{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between', 
  width: '90%',
  height: '50vh',
  padding: '5px',
  boxSizing: 'border-box',
},
contain: {
  display: 'flex',
  gap: '20px',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '50%',
  padding: '10px', 
  zIndex: 2,
  opacity: 0.9,
  flex: 1,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  height: '50vh',
  marginTop: '100px',
  marginLeft: '10px',
},
title: {
  fontSize: '35px',
  textAlign: 'center',
  marginBottom: '300px',
},
miniScoresContainer:{
  display: 'flex',
  justifyContent: 'center', 
  alignItems: 'center',
  width: '100%',
  height: '9vh',
  padding: '20px',
  boxSizing: 'border-box',
},
miniContain: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,   
  fontWeight: 900,
  fontSize: '100px',
  zIndex: 2,
  opacity: 1,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  height: '25vh',
  marginBottom: '200px',
},
headContainer: {
  display: 'flex',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
  width: '96%',
  position: 'fixed',
  top: 20,
  flexDirection: 'row',    
},
head: {
  textAlign: 'center',
  flex: 1,
  justifyContent: 'center',
},
cont: {
  position: 'fixed',
  top: '250px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  width: '95%',
  textAlign: 'center',
  zIndex: 1,
  opacity: 0.9,
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  padding: '5px',
  marginTop: '8px',
}  
};

export default TestYourself;