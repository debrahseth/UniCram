import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, deleteDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';

const QuizCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [senderScores, setSenderScores] = useState(null);
  const [receiverScores, setReceiverScores] = useState(null);
  const [isSenderScoreLoaded, setIsSenderScoreLoaded] = useState(false);
  const [isReceiverScoreLoaded, setIsReceiverScoreLoaded] = useState(false);
  const { senderUsername, receiverUsername, challengeId } = location.state || {};

  useEffect(() => {
    const loadScores = async () => {
      try {
        if (challengeId) {
          const challengeRef = doc(db, 'challenges', challengeId);
          const scoresRef = collection(challengeRef, 'scores');
          const senderDoc = await getDoc(doc(scoresRef, 'sender'));
          const receiverDoc = await getDoc(doc(scoresRef, 'receiver'));

          if (senderDoc.exists()) {
            setSenderScores(senderDoc.data().senderScore);
            setIsSenderScoreLoaded(true);
          } else {
            console.error('Sender score not found in Firestore');
          }

          if (receiverDoc.exists()) {
            setReceiverScores(receiverDoc.data().receiverScore);
            setIsReceiverScoreLoaded(true);
          } else {
            console.error('Receiver score not found in Firestore');
          }
        }
      } catch (error) {
        console.error('Error retrieving scores from Firestore:', error);
      }
    };

    loadScores();
  }, [challengeId]);

  const resetScoresAndNavigate = async () => {
    try {
      if (challengeId) {
        const challengeRef = doc(db, 'challenges', challengeId);
        await deleteDoc(challengeRef);
        console.log('Challenge deleted from "challenges" collection');
      }
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

export default QuizCompleted;
