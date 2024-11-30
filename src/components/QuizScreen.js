import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const QuizScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { challengeId } = location.state || {}; // Get challengeId from previous screen

  const [challengerUsername, setChallengerUsername] = useState('');
  const [challengedUsername, setChallengedUsername] = useState('');
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch challenge data (challengerId, challengedId)
  const fetchChallengeData = async () => {
    if (!challengeId) return;

    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);
      const challengeDoc = await getDoc(challengeDocRef);

      if (challengeDoc.exists()) {
        const challengeData = challengeDoc.data();
        const { challengerId, challengedId } = challengeData;

        // Fetch usernames for challenger and challenged
        fetchUsernames(challengerId, challengedId);
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

  // Fetch the challenge data and usernames on component mount
  useEffect(() => {
    fetchChallengeData();
  }, [challengeId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={styles.quizContainer}>
      <h2>Quiz Challenge</h2>
      <p><strong>Challenger:</strong> {challengerUsername}</p>
      <p><strong>Challenged:</strong> {challengedUsername}</p>

      {/* You can add your quiz logic here */}
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
};

export default QuizScreen;
