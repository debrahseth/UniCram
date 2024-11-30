import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizData from '../assets/quizData';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { challengeId } = location.state || {};
  const [challengerUsername, setChallengerUsername] = useState('');
  const [challengedUsername, setChallengedUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [status, setStatus] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [challengerAnswers, setChallengerAnswers] = useState([]);
  const [challengedAnswers, setChallengedAnswers] = useState([]); 
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [challengerScore, setChallengerScore] = useState(0);
  const [challengedScore, setChallengedScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [timerInterval, setTimerInterval] = useState(null);

  const fetchChallengeData = async () => {
    if (!challengeId) return;
    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeDocRef);
      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data();
        const { challengerId, challengedId, quiz: quizName, status } = challengeData;
        setStatus(status);
        if (status === 'accepted') {
          fetchUsernames(challengerId, challengedId);
          fetchQuizData(quizName);
        } else {
          console.log('Challenge not accepted yet');
        }
      } else {
        console.error('Challenge not found');
      }
    } catch (error) {
      console.error('Error fetching challenge data:', error);
    }
  };

  const fetchUsernames = async (challengerId, challengedId) => {
    try {
      const challengerDocRef = doc(db, 'users', challengerId);
      const challengerDoc = await getDoc(challengerDocRef);
      if (challengerDoc.exists()) {
        setChallengerUsername(challengerDoc.data().username);
      } else {
        setChallengerUsername('Unknown');
      }
      const challengedDocRef = doc(db, 'users', challengedId);
      const challengedDoc = await getDoc(challengedDocRef);
      if (challengedDoc.exists()) {
        setChallengedUsername(challengedDoc.data().username);
      } else {
        setChallengedUsername('Unknown');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching usernames:', error);
      setLoading(false);
    }
  };

  const fetchQuizData = (quizName) => {
    if (quizName && quizData[quizName]) {
      setQuiz(quizData[quizName]);
    } else {
      console.error('Quiz not found for:', quizName);
    }
  };

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
    const currentQuestion = quiz[currentQuestionIndex];
    // Track answers separately for each player
    setChallengerAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });
    setChallengedAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });

    setTimeout(() => {
      setSelectedAnswer(null);
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }, 500);
  };

  const calculateScores = () => {
    let challengerScoreTemp = 0;
    let challengedScoreTemp = 0;
    quiz.forEach((question, index) => {
      if (challengerAnswers[index] !== undefined && challengerAnswers[index] === question.correctAnswer) {
        challengerScoreTemp += 1;
      }
      if (challengedAnswers[index] !== undefined && challengedAnswers[index] === question.correctAnswer) {
        challengedScoreTemp += 1;
      }
    });
    setChallengerScore(challengerScoreTemp);
    setChallengedScore(challengedScoreTemp);
  };

  const handleQuizFinish = () => {
    setIsQuizFinished(true);
    calculateScores();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  useEffect(() => {
    fetchChallengeData();

    const interval = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime === 0) {
          clearInterval(interval);
          handleQuizFinish();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000); 
    setTimerInterval(interval);

    return () => clearInterval(interval);
  }, [challengeId]);

  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;
  const isQuizFinishedFlag = currentQuestionIndex >= quiz?.length || timer === 0;
  useEffect(() => {
    if (isQuizFinishedFlag) {
      handleQuizFinish();
    }
  }, [isQuizFinishedFlag]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.quizContainer}>
      <h2>Quiz Challenge</h2>
      <p><strong>Challenger:</strong> {challengerUsername}</p>
      <p><strong>Challenged:</strong> {challengedUsername}</p>
      <h3>Time Remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</h3>
      {quiz && currentQuestion && !isQuizFinishedFlag ? (
        <div>
          <h3>{currentQuestion.quizName}</h3>
          <h4>{currentQuestion.question}</h4>
          <div style={styles.optionsContainer}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                style={{
                  ...styles.optionButton,
                  backgroundColor: selectedAnswer === option ? '#4CAF50' : '#008CBA',
                }}
                onClick={() => handleAnswerSelection(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : isQuizFinishedFlag ? (
        <div>
          <h3>Quiz Finished!</h3>
          <p><strong>{challengerUsername}'s Score:</strong> {challengerScore}</p>
          <p><strong>{challengedUsername}'s Score:</strong> {challengedScore}</p>
        </div>
      ) : (
        <p>Loading quiz question...</p>
      )}
      <button onClick={() => navigate('/dashboard')} style={styles.button}>Go Back to Dashboard</button>
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
  },
};

export default QuizScreen;
