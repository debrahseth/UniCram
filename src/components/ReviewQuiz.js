import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/op.jpg';

const ReviewQuiz = () => {
  const { state } = useLocation();
  const { selectedAnswers, questions } = state || {};
  const navigate = useNavigate();

  if (!state || !selectedAnswers || !questions) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <div style={styles.head}>
          <h2 style={styles.header}>Error</h2>
          <p>No quiz data available to review.</p>
          <button style={styles.restartButton} onClick={() => navigate('/dashboard')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const filteredQuestions = questions
    .map((q, index) => ({ ...q, originalIndex: index }))
    .filter(q => q.type !== 'Preamble');

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.head}>
        <h2 style={styles.header}>Review Your Quiz</h2>
      </div>
      <div style={styles.scrollableContainer}>
        {filteredQuestions.map((question, index) => {
          const rawUserAnswer = selectedAnswers[question.originalIndex];
          const userAnswer = (rawUserAnswer || '').trim().toLowerCase();
          let isCorrect = false;
          let displayCorrectAnswer = '';

          if (question.type === 'Fill-in' && Array.isArray(question.answer)) {
            const rangeAnswer = question.answer[0];
            if (rangeAnswer && rangeAnswer.includes('to')) {
              const [min, max] = rangeAnswer.split('to').map(Number);
              const userNumber = Number(userAnswer);
              isCorrect = !isNaN(userNumber) && userNumber >= min && userNumber <= max;
              displayCorrectAnswer = `${rangeAnswer}`;
            } else {
              isCorrect = question.answer.some(
                ans => ans.trim().toLowerCase() === userAnswer
              );
              displayCorrectAnswer = question.answer.join(', ');
            }
          } else if (Array.isArray(question.answer)) {
            isCorrect = question.answer.some(
              ans => ans.trim().toLowerCase() === userAnswer
            );
            displayCorrectAnswer = question.answer.join(', ');
          } else if (typeof question.answer === 'string') {
            isCorrect = userAnswer === question.answer.trim().toLowerCase();
            displayCorrectAnswer = question.answer;
          } else {
            displayCorrectAnswer = 'Unknown';
          }

          return (
            <div key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <p style={styles.questionText}>Question: {question.question}</p>
              <p style={{ color: isCorrect ? 'green' : 'red' }}>
                <strong>Your answer:</strong> {userAnswer || 'No answer'}
              </p>
              <p>
                <strong>Correct answer:</strong> {displayCorrectAnswer}
              </p>
              <p>
                <strong>Explanation:</strong> {question.explanation || 'No explanation provided'}
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
    height: '95vh',
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
  head: {
    width: '95%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '10px',
    textAlign: 'center',
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.8)",
    borderRadius: '10px 10px 10px 10px',
    position: 'relative',
    zIndex: 2,
    opacity: 0.9,
    top: '10px',
  },
  header: {
    fontSize: '3rem',
    color: '#333',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px'
  },
  oddRow: {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '10px'
  },
  questionText: {
    fontSize: '1.3rem',
    marginBottom: '10px',
  },
  restartButton: {
    padding: '5px 20px',
    fontSize: '40px',
    color: 'white',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '90%',
    backgroundColor: 'gold',
    boxShadow: '0 4px 8px rgba(3, 3, 3, 0.5)',
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
