import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizData from '../assets/quizData';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const QuizScreen = () => {
  const location = useLocation();
  const { selectedQuiz, challengeId } = location.state || {};
  const navigate = useNavigate();

  const [challengerUsername, setChallengerUsername] = useState('');
  const [challengedUsername, setChallengedUsername] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [challengerScore, setChallengerScore] = useState(0);
  const [challengedScore, setChallengedScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [challengerAnswers, setChallengerAnswers] = useState([]);
  const [challengedAnswers, setChallengedAnswers] = useState([]);

  const quizQuestions = quizData[selectedQuiz];

  if (!quizQuestions) {
    return <p>Quiz not found</p>;
  }

  // Shuffle function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Fetch usernames from Firebase
  const fetchUsernames = async () => {
    if (!challengeId) return;

    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeDocRef);

      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data();
        const { challengerId, challengedId } = challengeData;

        // Fetch Challenger Username
        const challengerDocRef = doc(db, 'users', challengerId);
        const challengerDoc = await getDoc(challengerDocRef);
        if (challengerDoc.exists()) {
          setChallengerUsername(challengerDoc.data().username);
        } else {
          setChallengerUsername('Unknown');
        }

        // Fetch Challenged Username
        const challengedDocRef = doc(db, 'users', challengedId);
        const challengedDoc = await getDoc(challengedDocRef);
        if (challengedDoc.exists()) {
          setChallengedUsername(challengedDoc.data().username);
        } else {
          setChallengedUsername('Unknown');
        }
      }
    } catch (error) {
      console.error('Error fetching challenge or usernames:', error);
    }
  };

  // Initialize Quiz (shuffling questions, setting initial states)
  const initializeQuiz = () => {
    const shuffled = [...quizQuestions];
    shuffleArray(shuffled);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);
    setChallengerScore(0);
    setChallengedScore(0);
    setAnswered(false);
    setTimeLeft(30);
  };

  // Timer logic for countdown
  let timer;
  if (timeLeft > 0) {
    timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsQuizComplete(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  } else {
    clearInterval(timer);
  }

  // Call both initialization and fetching when the component mounts
  if (challengeId) {
    fetchUsernames(); // Always call fetchUsernames if challengeId is available
  }
  initializeQuiz(); // Always initialize the quiz

  // Handle answer selection for both challenger and challenged
  const handleAnswerSelection = (selectedAnswer, participant) => {
    if (answered) return;

    if (participant === 'challenger') {
      setChallengerAnswers([...challengerAnswers, selectedAnswer]);
      if (selectedAnswer === shuffledQuestions[currentQuestionIndex]?.answer) {
        setChallengerScore(challengerScore + 1);
      }
    } else if (participant === 'challenged') {
      setChallengedAnswers([...challengedAnswers, selectedAnswer]);
      if (selectedAnswer === shuffledQuestions[currentQuestionIndex]?.answer) {
        setChallengedScore(challengedScore + 1);
      }
    }

    setAnswered(true);
    setTimeout(() => {
      if (currentQuestionIndex + 1 < shuffledQuestions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswered(false);
      } else {
        setIsQuizComplete(true);
      }
    }, 1000);
  };

  // End quiz and navigate to the dashboard
  const endQuiz = () => {
    setIsQuizComplete(true);
    navigate('/dashboard');
  };

  // Toggle review mode
  const toggleReview = () => {
    setShowReview(!showReview);
  };

  return (
    <div style={styles.quizContainer}>
      {isQuizComplete || timeLeft === 0 ? (
        <div>
          <h2>Quiz Complete!</h2>
          <p><strong>{challengedUsername}'s score:</strong> {challengerScore} / {shuffledQuestions.length}</p>
          <p><strong>{challengerUsername}'s score:</strong> {challengedScore} / {shuffledQuestions.length}</p>
          {challengerScore > challengedScore ? (
            <p>{challengedUsername} wins!</p>
          ) : challengedScore > challengerScore ? (
            <p>{challengerUsername} wins!</p>
          ) : (
            <p>It's a tie!</p>
          )}
          <button onClick={endQuiz} style={styles.button}>End Quiz</button>
          <button onClick={toggleReview} style={styles.button}>Review Quiz</button>
          {showReview && (
            <div style={styles.reviewContainer}>
              <h3>Quiz Review</h3>
              {shuffledQuestions.map((question, index) => (
                <div key={index} style={styles.reviewQuestion}>
                  <h4>{question.question}</h4>
                  <p><strong>{challengedUsername}'s answer:</strong> {challengerAnswers[index] || 'No answer selected'}</p>
                  <p><strong>{challengerUsername}'s answer:</strong> {challengedAnswers[index] || 'No answer selected'}</p>
                  <p><strong>Correct Answer:</strong> {question.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={styles.questionContainer}>
          <h2>{selectedQuiz}</h2>
          {shuffledQuestions[currentQuestionIndex] ? (
            <>
              <h3>{shuffledQuestions[currentQuestionIndex]?.question}</h3>
              <div style={styles.timerContainer}>
                <h4>Time Left: {timeLeft} seconds</h4>
              </div>
              <div style={styles.optionsContainer}>
                {shuffledQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleAnswerSelection(option, 'challenger')} 
                    disabled={answered} 
                    style={styles.optionButton}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div style={styles.optionsContainer}>
                {shuffledQuestions[currentQuestionIndex]?.options.map((option, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleAnswerSelection(option, 'challenged')} 
                    disabled={answered} 
                    style={styles.optionButton}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p>Loading question...</p>
          )}
        </div>
      )}
      <button onClick={() => navigate(-1)} style={styles.button}>Go Back</button>
    </div>
  );
};

const styles = {
  quizContainer: {
    padding: '20px',
    backgroundColor: '#f7f7f7',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '15px',
  },
  timerContainer: {
    marginTop: '20px',
  },
  optionsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  optionButton: {
    padding: '10px 20px',
    backgroundColor: '#008CBA',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    width: '45%',
  },
  reviewContainer: {
    marginTop: '30px',
    textAlign: 'left',
  },
  reviewQuestion: {
    marginBottom: '15px',
    backgroundColor: '#e9e9e9',
    padding: '15px',
    borderRadius: '8px',
  },
};

export default QuizScreen;
