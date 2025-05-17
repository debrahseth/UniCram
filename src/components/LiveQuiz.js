import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { dotStream } from 'ldrs';
import questionsData from '../questions/questions.json';
import logo from "../assets/op.jpg";

const LiveQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelOfStudy, programOfStudy, semesterOfStudy } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const course = questions[0]?.course || 'Unknown Course';

  dotStream.register();

  const QUIZ_OPEN_TIME = "15:00";
  const QUIZ_CLOSE_TIME = "24:30";

  const parseTime = (timeStr) => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const time = new Date();
    time.setHours(hour, minute, 0, 0);
    return time;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const openTime = parseTime(QUIZ_OPEN_TIME);
      const closeTime = parseTime(QUIZ_CLOSE_TIME);

      let targetTime;
      let isOpen = false;

      if (now >= openTime && now < closeTime) {
        isOpen = true;
        targetTime = closeTime;
      } else {
        if (now >= closeTime) {
          openTime.setDate(openTime.getDate() + 1);
        }
        targetTime = openTime;
      }

      const timeDiff = targetTime - now;
      setIsQuizOpen(isOpen);
      setTimeLeft(timeDiff);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUserDetailsAndQuestions = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setLoading(false);
          return;
        }
        const userData = userSnap.data();
        const { levelOfStudy, programOfStudy, semesterOfStudy } = userData;
        const filteredQuestions = questionsData.filter(
          q =>
            q.levelOfStudy === levelOfStudy &&
            q.programOfStudy === programOfStudy &&
            q.semesterOfStudy === semesterOfStudy
        );
        setQuestions(filteredQuestions);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfToday = Timestamp.fromDate(today);
        const quizQuery = query(
          collection(db, 'liveQuizzes'),
          where('userId', '==', auth.currentUser.uid),
          where('programOfStudy', '==', programOfStudy),
          where('levelOfStudy', '==', levelOfStudy),
          where('semesterOfStudy', '==', semesterOfStudy),
          where('timestamp', '>=', startOfToday)
        );
        const quizSnapshot = await getDocs(quizQuery);
        if (!quizSnapshot.empty) {
          setHasTakenQuiz(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user or quiz data:', error);
        setLoading(false);
      }
    };
    fetchUserDetailsAndQuestions();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (submitting || !isQuizOpen) {
      setSubmitting(false);
      return;
    }
    setSubmitting(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const newScore = score + (isCorrect ? 10 : -5);

    if (currentQuestionIndex + 1 < questions.length) {
      setScore(newScore);
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setSubmitting(false);
    } else {
      try {
        if (!auth.currentUser) {
          setSubmitting(false);
          return;
        }
        if (!levelOfStudy || !programOfStudy || !semesterOfStudy || !course) {
          setSubmitting(false);
          return;
        }
        const q = query(
          collection(db, 'liveQuizzes'),
          where('userId', '==', auth.currentUser.uid),
          where('programOfStudy', '==', programOfStudy),
          where('levelOfStudy', '==', levelOfStudy),
          where('semesterOfStudy', '==', semesterOfStudy)
        );
        const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        const existingData = querySnapshot.docs[0].data();
        const existingScore = typeof existingData.score === 'number' ? existingData.score : 0;
        const existingQuestion = typeof existingData.totalQuestions === 'number' ? existingData.totalQuestions : 0;

        await updateDoc(docRef, {
          score: existingScore + newScore,
          timestamp: Timestamp.fromDate(new Date()),
          totalQuestions: existingQuestion + questions.length,
          course: course
        });
      } else {
        await addDoc(collection(db, 'liveQuizzes'), {
          userId: auth.currentUser.uid,
          timestamp: Timestamp.fromDate(new Date()),
          score: newScore,
          totalQuestions: questions.length,
          levelOfStudy,
          programOfStudy,
          semesterOfStudy,
          course: course
        });
      }
        setScore(newScore);
        setQuizCompleted(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const totalScore = questions.length * 10;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h : ${minutes}m : ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m : ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div style={styles.spinnerContainer}>
        <div style={styles.background}></div>
        <div style={{ fontSize: '36px', color: 'blue' }}>
          Loading <l-dot-stream size="60" speed="2.5" color="blue"></l-dot-stream>
        </div>
      </div>
    );
  }

if (!isQuizOpen) {
  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={{ marginBottom: '20px', textAlign: 'center', boxShadow: '0 8px 8px rgba(0,0,0,0.8)', borderRadius: '20px', position: 'fixed', top: '50px', left: '50%', transform: 'translateX(-50%)', width: '90%'}}>
        <h2 style={{ fontSize: '50px', fontWeight: 'bold' }}>
          {new Date() >= parseTime(QUIZ_OPEN_TIME) && new Date() < parseTime(QUIZ_CLOSE_TIME)
            ? 'Quiz is open!. Ends in:'
            : 'Quiz is closed. Opens in:'}
        </h2>
      </div>
      <div style={{ padding: '10px', textAlign: 'center', fontSize: '150px', fontWeight: '900',boxShadow: '0 8px 8px rgba(0,0,0,0.8)', borderRadius: '20px', position: 'fixed', top: '35%', left: '50%', transform: 'translateX(-50%)', width: '90%'}}>
        {new Date() >= parseTime(QUIZ_OPEN_TIME) && new Date() < parseTime(QUIZ_CLOSE_TIME)
          ? `${formatTime(timeLeft)}`
          : `${formatTime(timeLeft)}`}
      </div>
      <button onClick={handleBackToDashboard} style={styles.button}>
        BACK TO DASHBOARD
      </button>
    </div>
  );
}

  if (hasTakenQuiz) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          You have already taken today's live quiz.
        </h2>
        <button onClick={handleBackToDashboard} style={{ ...styles.button, marginTop: '32px' }}>
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
              <div style={{ marginBottom: '20px', textAlign: 'center', boxShadow: '0 8px 8px rgba(0,0,0,0.8)', borderRadius: '20px', position: 'fixed', top: '50px', left: '50%', transform: 'translateX(-50%)', width: '90%'}}>
                <h1 style={{fontSize: '40px', textAlign:'center'}}>
                  Oops. <br/> We are sorry to inform you this. <br/> Come back later
                </h1>
              </div>
        <h2 style={{ padding: '10px', textAlign: 'center', fontSize: '60px', fontWeight: '900',boxShadow: '0 8px 8px rgba(0,0,0,0.8)', borderRadius: '20px', position: 'fixed', top: '35%', left: '50%', transform: 'translateX(-50%)', width: '90%'}}>
          No questions available for your study level.
        </h2>
        <button onClick={handleBackToDashboard} style={styles.button}>
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.background}></div>
        <h2 style={{ fontSize: '50px', fontWeight: 'bold', marginBottom: '16px' }}>
          Quiz Completed!
        </h2>
        <div style={styles.contain}>
          <div style={styles.mainContainer}>
            <h3 style={styles.title}>YOUR SCORE</h3>
            <div style={styles.miniScoresContainer}>
              <div style={styles.miniContain}>
                {score} / {totalScore}
              </div>
            </div>
          </div>
        </div>
        <button onClick={handleBackToDashboard} style={{ ...styles.button, marginTop: '32px' }}>
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
            <div style={styles.timerContainer}>
              <p style={styles.questionNumber}>LIVE QUIZ</p>
              <p style={styles.questionNumber}>Question {currentQuestionIndex + 1} of {questions.length}</p>
              <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: '500' }}>
                Time Left: {formatTime(timeLeft)}
              </p>
            </div>
            <div style={styles.cont}>
              <p style={styles.questionText}>
                Question {currentQuestionIndex + 1}: {currentQuestion.question}
              </p>
            </div>
            <div style={styles.Container}>
              {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question illustration"
                style={styles.questionImage}
              />
              )}
              <div style={styles.questionCard}>
                <div style={styles.optionsContainer}>
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      style={{
                        ...styles.optionButton,
                        backgroundColor: selectedAnswer === option ? '#007bff' : '#f8f9fa',
                        color: selectedAnswer === option ? '#fff' : '#333'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>    
            </div>  
      <div style={styles.navigation}>
        <button
          onClick={handleNextQuestion}
          disabled={selectedAnswer === null || !isQuizOpen}
          style={{
            ...styles.button1,
            opacity: selectedAnswer === null || !isQuizOpen ? 0.5 : 1,
            cursor: selectedAnswer === null || !isQuizOpen ? 'not-allowed' : 'pointer'
          }}
        >
          {submitting
            ? (currentQuestionIndex + 1 === questions.length ? 'Submitting...' : 'Loading...')
            : (currentQuestionIndex + 1 === questions.length ? 'FINISH' : 'NEXT')}
        </button>
      </div>
      <div style={styles.scrollingContainer}>
        <div style={styles.scrollingText}>
        🌟 Every small effort you make today builds the success of tomorrow. Keep pushing, keep learning — your dreams are worth it! 🌟
            Your journey matters. Keep striving, keep growing. Prime Academy believes in you! 🌟
            Success is the sum of small efforts repeated every day. Keep pushing! 🌟
            You’re not just studying — you’re building a future to be proud of. 🌟
            Every quiz you take is one step closer to mastering your field! 🌟
            &nbsp;&nbsp;&nbsp;&nbsp;
        🌟 Every small effort you make today builds the success of tomorrow. Keep pushing, keep learning — your dreams are worth it! 🌟
            Your journey matters. Keep striving, keep growing. Prime Academy believes in you! 🌟
            Success is the sum of small efforts repeated every day. Keep pushing! 🌟
            You’re not just studying — you’re building a future to be proud of. 🌟
            Every quiz you take is one step closer to mastering your field! 🌟    
        </div>
      </div>
    </div>
  );
};

const styles = {
container: {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '20px',
  maxHeight: '100vh',
  gap: '20px',
},
background: {
  content: '""',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url(${logo})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  opacity: 0.3,
  zIndex: -1,
},
spinnerContainer: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
},
timerContainer: {
  position: 'fixed',
  top: '0',
  left: '30px',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '90%',
  textAlign: 'center',
  zIndex: 2,
  opacity: 0.9,
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  padding: '5px',
  marginTop: '8px',
  backgroundColor: '#fff',
},
questionNumber: {
  fontSize: '30px',
  color: 'black',
  marginBottom: '2px',
  fontWeight: 'bold',
},
cont: {
  position: 'fixed',
  top: '230px',
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
  backgroundColor: '#fff',
},
Container: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  backgroundColor: '#fff',
  padding: '5px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  width: '90%',
  margin: '0 auto 30px',
  position: 'fixed',
  top: '43%',
  left: '50%',
  transform: 'translateX(-50%)',
},
questionCard: {
  backgroundColor: '#fff',
  padding: '10px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
  width: '100%',
  overflowY: 'auto',
  height: '270px',
},
questionImage: {
  width: '100%',
  height: '290px',
  objectFit: 'fill',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
},
scroll: {
  height: '330px',
  padding: '15px',
  border: '1px solid #ccc',
  borderRadius: '8px',
  backgroundColor: '#fff',
  position: 'fixed',
  width: '90%',
  top: '38%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  gap: '1rem',
},
questionText: {
  fontSize: '1.5rem',
  fontWeight: '500',
  padding: '5px',
},
optionsContainer: {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
},
optionButton: {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: '600',
},
navigation: {
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '95%',
  padding: '10px',
  zIndex: 2,
  opacity: 0.9,
  flex: 1,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  marginLeft: 'auto',
  marginRight: 'auto',
  backgroundColor: '#fff',
},
button: {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  cursor: 'pointer',
  fontSize: '30px',
  width: '98%',
  fontWeight: '800',
  position: "fixed",
  bottom: '30px',
  left: '50%',
  transform: 'translateX(-50%)',
},
button1: {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '30px',
  width: '95%',
  fontWeight: '800',
},
contain: {
  display: 'flex',
  gap: '20px',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '90%',
  padding: '10px',
  zIndex: 2,
  opacity: 0.9,
  flex: 1,
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
  height: '55vh',
  position: 'fixed',
  top: '25%',
},
title: {
  fontSize: '35px',
  textAlign: 'center',
  marginBottom: '300px',
},
miniScoresContainer: {
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
mainContainer: {
  height: '86vh',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
},
scrollingContainer: {
  position: 'fixed',
  bottom: 10,
  left: 0,
  width: '100%',
  height: '40px',
  backgroundColor: '#f0f0f0',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  boxShadow: '0 -8px 10px rgba(0,0,0,0.5)',
  animation: 'flyIn 1.5s ease-out',
},
scrollingText: {
  display: 'inline-block',
  whiteSpace: 'nowrap',
  fontSize: '20px',
  color: '#333',
  animation: 'scrollText 60s linear infinite',
}
};
const globalStyles = `
  @keyframes scrollText {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  @keyframes flyIn {
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0%); opacity: 1; }
  }
`;

export default LiveQuiz;