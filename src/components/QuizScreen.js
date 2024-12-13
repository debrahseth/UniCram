import { useLocation } from 'react-router-dom';

const QuizScreen = () => {
  const location = useLocation();
  const { senderId, receiverId, challengeId } = location.state;

  console.log('Sender:', senderId, 'Receiver:', receiverId, 'Challenge ID:', challengeId);

  return (
    <div>
      <h1>Quiz Challenge</h1>
    </div>
  );
};

export default QuizScreen;
