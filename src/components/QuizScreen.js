import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const QuizScreen = () => {
    const location = useLocation();
  
    useEffect(() => {
      const queryParams = new URLSearchParams(location.search);
      const senderId = queryParams.get('sender');
      const receiverId = queryParams.get('receiver');
      const challengeId = location.pathname.split('/')[2];
  
      console.log('Sender ID:', senderId);
      console.log('Receiver ID:', receiverId);
      console.log('Challenge ID:', challengeId);
    }, [location]);
  
    return (
      <div>
        <h1>Quiz Screen</h1>
      </div>
    );
  };
  
  export default QuizScreen;
