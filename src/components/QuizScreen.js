import React, { useState, useEffect } from 'react';
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

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        // Fetch challenge document by challengeId
        const challengeDocRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeDocRef);
        if (challengeDoc.exists()) {
          const challengeData = challengeDoc.data();
          const { challengerId, challengedId } = challengeData;

          // Fetch challenger username
          const challengerDocRef = doc(db, 'users', challengerId);
          const challengerDoc = await getDoc(challengerDocRef);
          if (challengerDoc.exists()) {
            setChallengerUsername(challengerDoc.data().username);
          } else {
            setChallengerUsername('Unknown');
          }

          // Fetch challenged username
          const challengedDocRef = doc(db, 'users', challengedId);
          const challengedDoc = await getDoc(challengedDocRef);
          if (challengedDoc.exists()) {
            setChallengedUsername(challengedDoc.data().username);
          } else {
            setChallengedUsername('Unknown');
          }
        } else {
          console.log("Challenge document not found");
        }
      } catch (error) {
        console.error('Error fetching challenge or usernames:', error);
      }
    };

    if (challengeId) {
      fetchUsernames();
    }

    const shuffled = [...quizQuestions];
    shuffleArray(shuffled);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setIsQuizComplete(false);
    setChallengerScore(0);
    setChallengedScore(0);
    setAnswered(false);
    setTimeLeft(30);
  }, [selectedQuiz, quizQuestions, challengeId]);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsQuizComplete(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelection = (selectedAnswer, participant) => {
    if (answered) return;
    if (participant === 'challenger') {
      setChallengerAnswers([...challengerAnswers, selectedAnswer]);
      if (selectedAnswer === currentQuestion.answer) {
        setChallengerScore(challengerScore + 1);
      }
    } else if (participant === 'challenged') {
      setChallengedAnswers([...challengedAnswers, selectedAnswer]);
      if (selectedAnswer === currentQuestion.answer) {
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

  const endQuiz = () => {
    setIsQuizComplete(true);
    navigate('/dashboard');
  };

  const toggleReview = () => {
    setShowReview(!showReview);
  };

  return (
    <div>
      {isQuizComplete || timeLeft === 0 ? (
        <div>
          <h2>Quiz Complete!</h2>
          <p><strong>{challengerUsername}'s score:</strong> {challengerScore} / {shuffledQuestions.length}</p>
          <p><strong>{challengedUsername}'s score:</strong> {challengedScore} / {shuffledQuestions.length}</p>
          {challengerScore > challengedScore ? (
            <p>{challengerUsername} wins!</p>
          ) : challengedScore > challengerScore ? (
            <p>{challengedUsername} wins!</p>
          ) : (
            <p>It's a tie!</p>
          )}
          <button onClick={endQuiz}>End Quiz</button>
          <button onClick={toggleReview}>Review Quiz</button>
          {showReview && (
            <div>
              <h3>Quiz Review</h3>
              {shuffledQuestions.map((question, index) => (
                <div key={index}>
                  <h4>{question.question}</h4>
                  <p><strong>{challengerUsername}'s answer:</strong> {challengerAnswers[index] || 'No answer selected'}</p>
                  <p><strong>{challengedUsername}'s answer:</strong> {challengedAnswers[index] || 'No answer selected'}</p>
                  <p><strong>Correct Answer:</strong> {question.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2>{selectedQuiz}</h2>
          {currentQuestion ? (
            <>
              <h3>{currentQuestion.question}</h3>
              <div>
                <h4>Time Left: {timeLeft} seconds</h4>
                <div>
                  {currentQuestion.options.map((option, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleAnswerSelection(option, 'challenger')} 
                      disabled={answered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div>
                  {currentQuestion.options.map((option, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleAnswerSelection(option, 'challenged')} 
                      disabled={answered}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p>Loading question...</p>
          )}
        </div>
      )}
      <button onClick={() => navigate(-1)} style={styles.button}>
        Go Back
      </button>
    </div>
  );
};

const styles = {
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '15px',
      },
};

export default QuizScreen;
