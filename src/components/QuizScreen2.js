import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, setDoc, updateDoc } from 'firebase/firestore';
import { courseData } from './courseData';
import '../styles.css';
import { getAuth } from 'firebase/auth';
import { FaClock } from 'react-icons/fa';
import logo from "../assets/main.jpg";

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
  const [challengeId, setChallengeId] = useState('');
  const [timer, setTimer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [formattedTime, setFormattedTime] = useState('00:00');
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [course, setCourse] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const auth = getAuth();
  const currentUser = auth.currentUser; 

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const senderId = queryParams.get('sender');
    const receiverId = queryParams.get('receiver');
    const extractedChallengeId = location.pathname.split('/')[2];
    setChallengeId(extractedChallengeId);

    const fetchChallengeData = async () => {
      try {
        const challengeRef = doc(db, 'challenges', extractedChallengeId);
        const challengeSnap = await getDoc(challengeRef);
        if (challengeSnap.exists()) {
          const challenge = challengeSnap.data();
          const { course, difficulty } = challenge;
          setCourse(course);
          let timeInSeconds = 0;
          switch (difficulty) {
            case 'Easy':
              timeInSeconds = 300;
              break;
            case 'Medium':
              timeInSeconds = 600;
              break;
            case 'Hard':
              timeInSeconds = 900;
              break;
            default:
              timeInSeconds = 30;
          }
          setTimer(timeInSeconds);
          if (courseData[course] && courseData[course][difficulty]) {
            const questions = courseData[course][difficulty];
            setQuizData(questions);
          } 
        } 
        const senderRef = doc(db, 'users', senderId);
        const senderSnap = await getDoc(senderRef);
        if (senderSnap.exists()) {
          setSenderUsername(senderSnap.data().username);
        } 
        const receiverRef = doc(db, 'users', receiverId);
        const receiverSnap = await getDoc(receiverRef);
        if (receiverSnap.exists()) {
          setReceiverUsername(receiverSnap.data().username); 
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallengeData();
  }, [location]);

  const handleInputChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleAnswer = async () => {
    const normalizedAnswer = answer.trim().toLowerCase(); 
    const currentQuestion = quizData[currentQuestionIndex];
    const normalizedCorrectAnswer = currentQuestion.answer.trim().toLowerCase();
    const isCorrect = normalizedAnswer === normalizedCorrectAnswer;
      setUserAnswers((prevAnswers) => ({
        ...prevAnswers,
        sender: [...prevAnswers.sender, answer],
      }));
      if (isCorrect) {
        setSenderScores((prevScore) => prevScore + 1);
      }
      try {
        const challengeRef = doc(db, 'challenges', challengeId);
        const scoresRef = collection(challengeRef, 'scores');
        const scoresData = { senderScore: senderScores + (isCorrect ? 1 : 0) }; 
        await setDoc(doc(scoresRef, 'sender'), scoresData);
      } catch (error) {
        console.error('Error updating score to Firestore:', error);
      }
      if (currentQuestionIndex < quizData.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsQuizComplete(true);
      }
    };

  const handleAnswerSelect = async (answer) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      sender: [...prevAnswers.sender, answer],
    }));
    const currentQuestion = quizData[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.answer;
        if (isCorrect) {
            setSenderScores((prevScore) => prevScore + 1);
        }
            const challengeRef = doc(db, 'challenges', challengeId);
            const scoresRef = collection(challengeRef, 'scores');
            const scoresData = { senderScore: senderScores + (isCorrect ? 1 : 0) };
            await setDoc(doc(scoresRef, 'sender'), scoresData);
        if (currentQuestionIndex < quizData.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsQuizComplete(true);
        }
    };

    const handleSelect = (option) => {
      if (currentQuestion.type === 'Multiple Answers') {
        setSelectedAnswers((prevAnswers) => {
          if (prevAnswers.includes(option)) {
            return prevAnswers.filter((ans) => ans !== option);
          } else {
            return [...prevAnswers, option];
          }
        });
      } else {
        setAnswer(option);
      }
    };

    const handleNextQuestion = async () => {
      const currentQuestion = quizData[currentQuestionIndex];
      let isCorrect = false;
      if (currentQuestion.type === 'Multiple Answers') {
        if (selectedAnswers.length === 0) {
          alert('Please select at least one answer!');
          return;
        }
      isCorrect = selectedAnswers.every((answer) => currentQuestion.correctAnswers.includes(answer)) &&
      selectedAnswers.length === currentQuestion.correctAnswers.length;
    }
    if (isCorrect) {
      setSenderScores((prevScore) => prevScore + 1);
    }
      const challengeRef = doc(db, 'challenges', challengeId);
      const scoresRef = collection(challengeRef, 'scores');
      const scoresData = { senderScore: senderScores + (isCorrect ? 1 : 0) };
      await setDoc(doc(scoresRef, 'sender'), scoresData);
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleGoToQuizResults = async () => {
    if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          status: 'online'
        });
        navigate('/quiz-completed', {
          state: { receiverUsername, senderUsername, challengeId }
        });
    }
  };
  
    useEffect(() => {
      if (timer > 0 && !isQuizComplete) {
        const countdown = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
        return () => clearInterval(countdown);
      } else if (timer === 0) {
        setIsQuizComplete(true);
      }
    }, [timer, isQuizComplete]);

  useEffect(() => {
    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;
    setFormattedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
  }, [timer]);

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
      <div style={styles.container}>
        <div style={styles.background}></div>
          <div style={styles.header}>
            <h1 style={{fontSize: '36px'}}>Quiz Completed!</h1>
          </div>
          <div style={styles.headContainer}>
            <div style={styles.head}>
              <h2 style={{fontSize: '30px'}}>Your Score</h2>
            </div> 
          </div>
          <div style={styles.mainContainer}>
            <div style={styles.miniContain}>
              {senderScores}
            </div>
          </div>
          <div style={styles.buttonContainer}>
            <button onClick={handleGoToQuizResults} style={styles.goBackButton}>
              Go to Quiz Results
            </button>
          </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
        <div style={styles.header}>
          <h1 style={{fontSize: "40px"}}>Quiz: {course}</h1>
        </div>
        <div style={styles.con}>
          <div style={styles.timerContainer}>
            <FaClock style={styles.icon} /> <h4 style={{fontSize: "30px"}}>Time remaining: {formattedTime}</h4>
          </div>
        </div>
        <div style={styles.contain}>
          <h2 style={{fontSize: "20px", textAlign: 'center'}}>Question {currentQuestionIndex + 1} of {quizData.length}:</h2>
          <h2 style={{fontSize: "30px", textAlign: 'center'}}>{currentQuestion.question}</h2>
        </div>
      {currentQuestion.type === 'True/False' && (
        <div>
          <div style={styles.con1}>
            <button onClick={() => handleAnswerSelect('True')} style={styles.button}>True</button>
            <button onClick={() => handleAnswerSelect('False')} style={styles.button}>False</button>
          </div>
        </div>
      )}
      {currentQuestion.type === 'Multiple Choice' && (
        <div>
          <div style={styles.Con3}>
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => handleAnswerSelect(option)} style={styles.answerButton}>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
      {currentQuestion.type === 'Multiple Answers' && (
       <div>
       <div style={styles.con3}>
         {currentQuestion.options.map((option, index) => (
           <label key={index} style={styles.label}>
             <input
               type="checkbox"
               value={option}
               checked={selectedAnswers.includes(option)}
               onChange={() => handleSelect(option)}
               style={styles.checkbox}
             />
             {option}
           </label>
         ))}
       </div>
      <div style={styles.con2}>
        <button onClick={handleNextQuestion} style={styles.submitButton}>
          Submit Answer
        </button>
      </div>
     </div>     
      )}
      {currentQuestion.type === 'Fill-in' && (
        <div>
          <input
            type="text"
            placeholder="Enter your answer"
            value={answer}
            onChange={handleInputChange}
            style={styles.inputField}
          />
          <div style={styles.con2}>
            <button onClick={() => handleAnswer('answer')} style={styles.submitButton}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  mainContainer: {
    height: "55vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "90%",
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: "auto",
    marginRight: "auto",
  },
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
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
    position: "fixed",
    top: "15px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "96%",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    zIndex: 10,
    opacity: "0.7",
    borderRadius: '10px',
  },
  headContainer: {
    display: 'flex',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    width: '96%',
    marginTop: '160px',
    flexDirection: 'row', 
    marginLeft: "auto",
    marginRight: "auto",     
  },
  head: {
    textAlign: 'center',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
  },
  con: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', 
    width: '96%',
    padding: '5px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '160px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  con1: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    padding: '10px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '150px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  con2: {
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
  con3: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    padding: '30px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '20px',
    marginBottom: '20px',
    marginLeft: "auto",
    marginRight: "auto",
    gap: '20px',
  },  
  Con3: {
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
    marginTop: '10px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  contain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', 
    width: '90%',
    padding: '5px',
    textAlign: 'center',
    zIndex: 2,
    opacity: 0.9,
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    marginTop: '10px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  miniContain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,   
    width: '50%',
    fontWeight: 900,
    fontSize: '300px',
    zIndex: 2,
    opacity: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '30vh',
    marginBottom: '20px',
    marginTop: '20px',
  },
  timerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: '10px',
    fontSize: '25px',
  },
  button: {
    flex: 1,
    margin: '0 10px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
  },
  inputField: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '90%',
    marginBottom: '30px',
    marginTop: '100px',
    marginLeft: "auto",
    marginRight: "auto",
  },
  answerButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 25px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    marginBottom: '5px',
    marginTop: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
  },
  buttonContainer: {
    width: '90%',
    bottom: '20',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    borderRadius: '10px',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: "auto",
    marginRight: "auto",
  },
  goBackButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '10px',
    width: '60%',
    border: 'none',
    marginTop: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    marginRight: '8px', 
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50', 
  },
  checkboxUnchecked: {
    backgroundColor: '#f0f0f0',
  },
  label: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px 25px',
    fontSize: '20px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    marginBottom: '10px',
    marginTop: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
export default QuizScreen2;