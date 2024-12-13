import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaEye, FaArrowLeft } from 'react-icons/fa';

const Result = () => {
  const [showReview, setShowReview] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { score, userAnswers, questions } = location.state || {};
  if (!(score || score === 0) || !userAnswers || !questions) {
    return <div>Error: No quiz results found. Please complete the quiz first.</div>;
  }

  const totalQuestions = questions.length;
  const percentage = (score / totalQuestions) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
      <h2 style={{fontSize: '36px'}}>Quiz Completed</h2>
      <p style={{fontSize: '20px'}}>Your score is: {score} out of {totalQuestions}</p>

      <div style={styles.progressBarContainer}>
        <div style={{ ...styles.progressBar, width: `${percentage}%` }}></div>
      </div>
      <p style={{fontSize: '20px'}}>{percentage.toFixed(2)}% - {percentage >= 50 ? 'Passed' : 'Failed'}</p>
      <div style={styles.reviewButtonContainer}>
        <button onClick={() => setShowReview(!showReview)} style={styles.reviewButton}>
          <FaEye style={styles.icon} /> {showReview ? 'Hide Review' : 'Review Answers'}
        </button>
      </div>
      </div>
      {showReview && (
        <div style={styles.scrollableContainer}>
          <h3>Review Your Answers</h3>
          {questions.map((question, index) => {
            const userAnswer = userAnswers.find((answer) => answer.questionId === index)?.answer;
            const isCorrect = userAnswer === question.answer;
            return (
              <div key={index} style={styles.questionContainer}>
                <p><strong>Q{index + 1}:</strong> {question.question}</p>
                <p><strong>Your Answer:</strong> {userAnswer}</p>
                <p><strong>Correct Answer:</strong> {question.answer}</p>
                <p style={{ color: isCorrect ? 'green' : 'red' }}>
                  {isCorrect ? <FaCheckCircle style={styles.correctIcon} /> : <FaTimesCircle style={styles.incorrectIcon} />}
                  {isCorrect ? 'Correct' : 'Incorrect'}
                </p>
              </div>
            );
          })}
        </div>
      )}
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate('/dashboard')} style={styles.goBackButton}>
          <FaArrowLeft style={styles.icon} /> Go Back
        </button>
      </div>
    </div>
  );
};
const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '96%',
    backgroundColor: '#FFD700',
    padding: '15px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
    position: 'fixed',
    top: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: '30px',
    backgroundColor: '#e0e0e0',
    borderRadius: '15px',
    marginTop: '20px',
    marginBottom: '10px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#76c7c0',
    borderRadius: '15px',
  },
  buttonContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonContainer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    position: 'fixed',
    bottom: '0',
    left: '0',
    backgroundColor: '#fff',
    // padding: '6px',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
  reviewButton: {
    padding: '10px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  questionContainer: {
    textAlign: 'left',
    margin: '10px 0',
    padding: '10px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  correctIcon: {
    color: 'green',
    marginRight: '8px',
  },
  incorrectIcon: {
    color: 'red',
    marginRight: '8px',
  },
  icon: {
    marginRight: '8px',
  },
  scrollableContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '98%',
    marginTop: "300px",
    marginBottom: "60px",
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    opacity: "0.9",
  },
};
export default Result;