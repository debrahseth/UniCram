import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuizCompleted = () => {
  const location = useLocation();
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
          setIsSenderScoreLoaded(true);
        }
        if (storedReceiverScore !== null) {
          setReceiverScores(JSON.parse(storedReceiverScore));
          setIsReceiverScoreLoaded(true);
        }
      } catch (error) {
        console.error('Error retrieving scores from AsyncStorage:', error);
      }
    };
    loadScores();
  }, []);

  return (
    <div>
      <h1>Quiz Completed!</h1>
      <h2>Results</h2>
      <p>
        {senderUsername}'s Score:{' '}
        {isSenderScoreLoaded ? (
          senderScores
        ) : (
          <span>Loading...</span>
        )}
      </p>
      <p>
        {receiverUsername}'s Score:{' '}
        {isReceiverScoreLoaded ? (
          receiverScores
        ) : (
          <span>Loading...</span>
        )}
      </p>
    </div>
  );
};

export default QuizCompleted;
