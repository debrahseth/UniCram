import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { courseData } from './courseData';

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({ sender: [], receiver: [] });
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedTime, setFormattedTime] = useState('00:00');
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [scores, setScores] = useState({ sender: 0, receiver: 0 }); 

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
      } catch (error) {
        console.error('Error fetching challenge data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallengeData();
  }, [location]);

  const handleAnswerSelect = (answer, userType) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [userType]: [...prevAnswers[userType], answer],
    }));

    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizComplete(true);
      calculateScores();
    }
  };

  const calculateScores = () => {
    let senderScore = 0;
    let receiverScore = 0;
    quizData.forEach((question, index) => {
      if (userAnswers.sender[index] === question.answer) {
        senderScore += 1;
      }
      if (userAnswers.receiver[index] === question.answer) {
        receiverScore += 1;
      }
    });
    setScores({ sender: senderScore, receiver: receiverScore });
  };

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  useEffect(() => {
    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;
    setFormattedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }, [timer]);

  if (isLoading) {
    return <div>Loading quiz...</div>;
  }

  if (!quizData) {
    return <div>Error loading quiz data.</div>;
  }

  if (isQuizComplete) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        <p>Sender Score: {scores.sender}</p>
        <p>Receiver Score: {scores.receiver}</p>
        <button onClick={() => navigate('/quiz-completed')}>Go to Quiz Results</button>
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
          <button onClick={() => handleAnswerSelect('True', 'sender')}>True</button>
          <button onClick={() => handleAnswerSelect('False', 'sender')}>False</button>
        </div>
      )}

      {currentQuestion.type === 'Multiple Choice' && (
        <div>
          {currentQuestion.options.map((option, index) => (
            <button key={index} onClick={() => handleAnswerSelect(option, 'sender')}>
              {option}
            </button>
          ))}
        </div>
      )}

      {currentQuestion.type === 'Fill-in' && (
        <div>
          <input
            type="text"
            onBlur={(e) => handleAnswerSelect(e.target.value, 'sender')}
            placeholder="Enter your answer"
          />
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
