import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { courseData } from './courseData';
import '../styles.css';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuizScreen2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({ sender: [] });
  const [answer, setAnswer] = useState('');
  const [senderScores, setSenderScores] = useState(0);
  const [receiverUsername, setReceiverUsername] = useState('');
  const [senderUsername, setSenderUsername] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedTime, setFormattedTime] = useState('00:00');
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [loadingSenderScore, setLoadingSenderScore] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const senderId = queryParams.get('sender');
    const receiverId = queryParams.get('receiver');
    const challengeId = location.pathname.split('/')[2];

    const fetchChallengeData = async () => {
      try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeSnap = await getDoc(challengeRef);
        if (challengeSnap.exists()) {
          const challenge = challengeSnap.data();
          const { course, difficulty } = challenge;
          let timeInSeconds = 0;
          switch (difficulty) {
            case 'Easy':
              timeInSeconds = 30;
              break;
            case 'Medium':
              timeInSeconds = 45;
              break;
            case 'Hard':
              timeInSeconds = 60;
              break;
            default:
              timeInSeconds = 30;
          }
          setTimer(timeInSeconds);
          if (courseData[course] && courseData[course][difficulty]) {
            const questions = courseData[course][difficulty];
            setQuizData(questions);
          } else {
            console.error('No questions found for this course and difficulty');
          }
        } else {
          console.error('Challenge not found');
        }
        const senderRef = doc(db, 'users', senderId);
        const senderSnap = await getDoc(senderRef);
        if (senderSnap.exists()) {
          setSenderUsername(senderSnap.data().username);
        } else {
          console.error('Sender not found');
        }
        const receiverRef = doc(db, 'users', receiverId);
        const receiverSnap = await getDoc(receiverRef);
        if (receiverSnap.exists()) {
          setReceiverUsername(receiverSnap.data().username); 
        } else {
          console.error('Receiver not found');
        }
      } catch (error) {
        console.error('Error fetching challenge data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallengeData();
  }, [location]);

  const handleInputChange = (e) => {
    setAnswer(e.target.value);
  };
  const handleAnswer = () => {
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        sender: [...prevAnswers.sender, answer],
      }));
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        calculateScores();
        setAnswer('');
      } else {
        setIsQuizComplete(true);
        calculateScores();
      }
  };

  const handleAnswerSelect = (answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      sender: [...prevAnswers.sender, answer],
    }));
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      calculateScores();
    } else {
      setIsQuizComplete(true);
      calculateScores();
    }
  };
  
  const calculateScores = async () => {
    let senderScore = 0;
    quizData.forEach((question, index) => {
      if (userAnswers.sender[index] === question.answer) {
        senderScore += 1;
      }
    });
    try {
        await AsyncStorage.setItem('senderScore', JSON.stringify(senderScore));
        setSenderScores(senderScore);
        console.log('Sender score saved to AsyncStorage:', senderScore);
      } catch (error) {
        console.error('Error saving score to AsyncStorage:', error);
      }
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      if (timer === 1) {
        clearInterval(countdown);
        setIsQuizComplete(true);
        calculateScores();
      }
      return () => clearInterval(countdown);
    }
  }, [timer]);

  useEffect(() => {
    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;
    setFormattedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }, [timer]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoadingSenderScore(false);
    }, 30000);

    return () => clearTimeout(timeout);
  }, [senderScores]);

  if (isLoading) {
    return (
    <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading quiz...</p>
    </div>
    );
  }
  if (!quizData) {
    return <div>Error loading quiz data.</div>;
  }

  if (isQuizComplete) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        {loadingSenderScore ? (
        <div className="spinner-container">
            <div className="spinner"></div>
            <p>Loading {senderUsername}'s score...</p>
        </div>
        ) : (
        <p>{senderUsername}'s Score: {senderScores}</p>)}
        {!loadingSenderScore && (
        <button 
          onClick={() => navigate('/quiz-completed', { state: { receiverUsername, senderUsername } })}
        >
          Go to Quiz Results
        </button>
      )}
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div>
      <h1>{currentQuestion.question}</h1>
      <p>Time remaining: {formattedTime}</p>
      {currentQuestion.type === 'True/False' && (
        <div>
          <button onClick={() => handleAnswerSelect('True')}>True</button>
          <button onClick={() => handleAnswerSelect('False')}>False</button>
        </div>
      )}
      {currentQuestion.type === 'Multiple Choice' && (
        <div>
          {currentQuestion.options.map((option, index) => (
            <button key={index} onClick={() => handleAnswerSelect(option)}>
              {option}
            </button>
          ))}
        </div>
      )}
      {currentQuestion.type === 'Fill-in' && (
        <div>
          <input
            type="text"
            placeholder="Enter your answer"
            value={answer}
            onChange={handleInputChange}
          />
          <button onClick={() => handleAnswer('answer')}>Submit</button>
        </div>
      )}
    </div>
  );
};

const styles ={
}
export default QuizScreen2;