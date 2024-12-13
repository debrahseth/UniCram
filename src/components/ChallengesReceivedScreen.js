import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChallengesReceivedScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserId(currentUser.uid);
    }

    const fetchChallenges = async () => {
      if (currentUserId) {
        try {
          const challengesQuery = query(
            collection(db, 'challenges'),
            where('receiverId', '==', currentUserId),
            where('status', '==', 'pending')
          );

          const snapshot = await getDocs(challengesQuery);
          const challengeList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setChallenges(challengeList);
        } catch (error) {
          console.error('Error fetching challenges:', error);
        }
      }
    };

    fetchChallenges();
  }, [currentUserId]);

  const handleAcceptChallenge = async (challengeId, senderId, receiverId) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'accepted',
      });
      await deleteDoc(challengeRef);
      console.log('Challenge accepted and deleted!');
      navigate(`/quiz/${challengeId}?sender=${senderId}&receiver=${receiverId}`);
      setChallenges((prevChallenges) =>
        prevChallenges.filter((challenge) => challenge.id !== challengeId)
      );
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        status: 'declined',
      });
      await deleteDoc(challengeRef);

      console.log('Challenge declined and deleted!');
      setChallenges((prevChallenges) =>
        prevChallenges.filter((challenge) => challenge.id !== challengeId)
      );
    } catch (error) {
      console.error('Error declining challenge:', error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f7fc', height: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#333', marginBottom: '20px' }}>
        Challenges Sent to You
      </h1>
      {challenges.length === 0 ? (
        <p style={{ fontSize: '16px', color: '#555' }}>No challenges at the moment.</p>
      ) : (
        challenges.map((challenge) => (
          <div
            key={challenge.id}
            style={{
              backgroundColor: '#fff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '15px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3>{challenge.course} - {challenge.difficulty}</h3>
            <p>Challenge sent by: User {challenge.senderId}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => handleAcceptChallenge(challenge.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaCheck style={{ marginRight: '8px' }} />
                Accept
              </button>
              <button
                onClick={() => handleDeclineChallenge(challenge.id)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaTimes style={{ marginRight: '8px' }} />
                Decline
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChallengesReceivedScreen;
