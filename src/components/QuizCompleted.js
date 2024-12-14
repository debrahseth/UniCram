import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuizCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [senderScores, setSenderScores] = useState(null);
  const [receiverScores, setReceiverScores] = useState(null);
  const [isSenderScoreLoaded, setIsSenderScoreLoaded] = useState(false);
  const [isReceiverScoreLoaded, setIsReceiverScoreLoaded] = useState(false);
  const { senderUsername, receiverUsername } = location.state || {};

  useEffect(() => {
    const loadScores = async () => {
      try {
        const storedSenderScore = await AsyncStorage.getItem('senderScore');
        const storedReceiverScore = await AsyncStorage.getItem('receiverScore');
        if (storedSenderScore !== null) {
          setSenderScores(JSON.parse(storedSenderScore));
        } else {
            setSenderScores(null);
        }
          setIsSenderScoreLoaded(true);
        if (storedReceiverScore !== null) {
          setReceiverScores(JSON.parse(storedReceiverScore));
        } else {
            setReceiverScores(null);
        }
          setIsReceiverScoreLoaded(true);
      } catch (error) {
        console.error('Error retrieving scores from AsyncStorage:', error);
      }
    };
    loadScores();
  }, []);

  const resetScoresAndNavigate = async () => {
    try {
      await AsyncStorage.removeItem('senderScore');
      await AsyncStorage.removeItem('receiverScore');
      console.log('Scores cleared from AsyncStorage');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error resetting scores:', error);
    }
  };

  return (
    <div>
      <h1>Quiz Completed!</h1>
      <h2>Results</h2>
      <p>
        {senderUsername}'s Score:{' '}
        {isSenderScoreLoaded ? (
          senderScores
        ) : (
          <span>Loading {senderUsername}'s score...</span>
        )}
      </p>
      <p>
        {receiverUsername}'s Score:{' '}
        {isReceiverScoreLoaded ? (
          receiverScores
        ) : (
          <span>Loading {receiverUsername}'s score...</span>
        )}
      </p>
      <button onClick={resetScoresAndNavigate}>
        Go Back to Dashboard
      </button>
    </div>
  );
};

const styles = {
};

export default QuizCompleted;