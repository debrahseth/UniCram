import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const QuizCompleted = () => {
  const location = useLocation();
  const [senderScores, setSenderScores] = useState(null);
  const [receiverScores, setReceiverScores] = useState(null);
  const [isSenderScoreLoaded, setIsSenderScoreLoaded] = useState(false);
  const [isReceiverScoreLoaded, setIsReceiverScoreLoaded] = useState(false);
  const { senderUsername, receiverUsername } = location.state || {};

  useEffect(() => {
    if (location.state) {
      setSenderScores(location.state.senderScores);
      setReceiverScores(location.state.receiverScores);
    }
    if (senderScores !== null) {
      setIsSenderScoreLoaded(true);
    }
    if (receiverScores !== null) {
      setIsReceiverScoreLoaded(true);
    }
  }, [location.state, senderScores, receiverScores]);

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
