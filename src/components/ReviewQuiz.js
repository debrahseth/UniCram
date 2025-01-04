import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/main.jpg';

const ReviewQuiz = () => {
  const { state } = useLocation();
  const { selectedAnswers, questions } = state;
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
        <h2 style={styles.header}>Review Your Quiz</h2>
      <div style={styles.scrollableContainer}>
      {questions.map((question, index) => {
        const userAnswer = selectedAnswers[index];
        const isCorrect = userAnswer === question.answer;
        return (
          <div key={index}>
            <p style={styles.questionText}>Question: {question.question}</p>
            <p>
              <strong>Your answer:</strong> {userAnswer || "No answer"}
            </p>
            <p style={{ color: isCorrect ? 'green' : 'red' }}>
              <strong>Correct answer:</strong> {question.answer}
            </p>
          </div>
        );
      })}
      </div>
        <button style={styles.restartButton} onClick={() => navigate('/dashboard')}>
          Go Home
        </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px',
    height: '90vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Poppins, sans-serif',
  },
  background: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`, 
    backgroundPosition: 'center', 
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    opacity: 0.5,
    zIndex: -1,
  },
  header: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '30px',
  },
  questionText: {
    fontSize: '1.5rem',
    marginBottom: '10px',
  },
  explanation: {
    fontSize: '1rem',
    color: '#333',
    marginTop: '10px',
  },
  restartButton: {
    padding: '5px 30px',
    fontSize: '40px',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '90%',
    bottom: '20',
    left: '0',
    backgroundColor: 'gold',
    boxShadow: '0 -4px 8px rgba(3, 3, 3, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: "auto",
    marginRight: "auto",
    fontWeight: '900'
  },
  scrollableContainer: {
    flex: 1,     
    marginTop: '20px',    
    overflowY: 'auto',
    opacity: '0.9',
    width: '100%'
  },
};

export default ReviewQuiz;
