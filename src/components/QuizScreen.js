import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import quizData from '../assets/quizData'; // Import your quizData
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { challengeId } = location.state || {}; // Get challengeId from previous screen

  const [challengerUsername, setChallengerUsername] = useState('');
  const [challengedUsername, setChallengedUsername] = useState('');
  const [loading, setLoading] = useState(true); // Track loading state
  const [quiz, setQuiz] = useState(null); // Store quiz data
  const [status, setStatus] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Store the selected answer for current question
  const [challengerAnswers, setChallengerAnswers] = useState([]); // Store answers for challenger
  const [challengedAnswers, setChallengedAnswers] = useState([]); // Store answers for challenged
  const [isQuizFinished, setIsQuizFinished] = useState(false); // Track quiz completion status
  const [challengerScore, setChallengerScore] = useState(0); // Track challenger score
  const [challengedScore, setChallengedScore] = useState(0); // Track challenged score

  // Fetch challenge data (challengerId, challengedId, quiz)
  const fetchChallengeData = async () => {
    if (!challengeId) return;

    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeDocRef);

      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data();
        const { challengerId, challengedId, quiz: quizName, status } = challengeData;

        setStatus(status);

        // Only fetch and display the quiz if the challenge is accepted
        if (status === 'accepted') {
          fetchUsernames(challengerId, challengedId);
          fetchQuizData(quizName); // Fetch quiz based on quiz name
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

  // Fetch usernames from users collection
  const fetchUsernames = async (challengerId, challengedId) => {
    try {
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

      setLoading(false); // Set loading to false after data is fetched
    } catch (error) {
      console.error('Error fetching usernames:', error);
      setLoading(false); // Stop loading on error
    }
  };

  // Fetch quiz data based on the quiz name
  const fetchQuizData = (quizName) => {
    console.log('Selected Quiz:', quizName); // Log the selected quiz name

    // Check if the selected quiz exists in the local quizData
    if (quizName && quizData[quizName]) {
      setQuiz(quizData[quizName]); // Set quiz data if found
    } else {
      console.error('Quiz not found for:', quizName);
    }
  };

  // Handle answer selection without updating scores immediately
  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);

    // Store the selected answer for each player
    const currentQuestion = quiz[currentQuestionIndex];

    if (currentQuestion.player === 'challenger') {
      setChallengerAnswers(prevAnswers => [...prevAnswers, answer]);
    } else {
      setChallengedAnswers(prevAnswers => [...prevAnswers, answer]);
    }

    // Move to the next question after a short delay to allow user to see their selection
    setTimeout(() => {
      setSelectedAnswer(null); // Reset selected answer for the next question
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    }, 500); // Adjust the delay as needed (500ms delay before moving to the next question)
  };

  // Calculate scores after quiz finishes
  const calculateScores = () => {
    let challengerScoreTemp = 0;
    let challengedScoreTemp = 0;

    quiz.forEach((question, index) => {
      if (challengerAnswers[index] === question.correctAnswer) {
        challengerScoreTemp += 1;
      }
      if (challengedAnswers[index] === question.correctAnswer) {
        challengedScoreTemp += 1;
      }
    });

    setChallengerScore(challengerScoreTemp);
    setChallengedScore(challengedScoreTemp);
  };

  // Handle quiz finish logic
  const handleQuizFinish = () => {
    setIsQuizFinished(true);
    calculateScores(); // Calculate scores when the quiz is finished
  };

  // Fetch the challenge data and usernames on component mount
  useEffect(() => {
    fetchChallengeData();
  }, [challengeId]);

  // Check if the quiz is finished
  const currentQuestion = quiz ? quiz[currentQuestionIndex] : null;
  const isQuizFinishedFlag = currentQuestionIndex >= quiz?.length;

  // If the quiz is finished, call handleQuizFinish
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

      {/* Display the quiz question */}
      {quiz && currentQuestion && !isQuizFinishedFlag ? (
        <div>
          <h3>{currentQuestion.quizName}</h3> {/* Display the name of the selected quiz */}
          <h4>{currentQuestion.question}</h4>
          <div style={styles.optionsContainer}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                style={{
                  ...styles.optionButton,
                  backgroundColor: selectedAnswer === option ? '#4CAF50' : '#008CBA', // Highlight selected answer
                }}
                onClick={() => handleAnswerSelection(option)} // Trigger automatic question change
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : isQuizFinishedFlag ? (
        <div>
          <h3>Quiz Finished!</h3>
          <p>Challenger Score: {challengerScore}</p>
          <p>Challenged Score: {challengedScore}</p>
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
