import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; 
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, updateDoc, doc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';

const UserChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to fetch the username of the challenger by userId
  const fetchChallengerUsername = async (challengerId) => {
    try {
      const userDocRef = doc(db, 'users', challengerId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const username = userDoc.data().username;
        return username;
      } else {
        return 'Unknown';
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  useEffect(() => {
    const fetchChallenges = async () => {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        const challengesQuery = query(
          collection(db, 'challenges'),
          where('challengedId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        const challengeSnapshot = await getDocs(challengesQuery);
        const challengesList = [];

        // Fetch the challenger username for each challenge
        for (let docSnap of challengeSnapshot.docs) {
          const challengeData = docSnap.data();
          const challengerUsername = await fetchChallengerUsername(challengeData.challengerId);
          challengesList.push({
            id: docSnap.id,
            challengerUsername,
            ...challengeData,
          });
        }

        setChallenges(challengesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching challenges: ", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchChallenges();
  }, []);

  const handleChallengeResponse = async (challengeId, action, quiz) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.error("No logged-in user found.");
      return;
    }

    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);

      if (action === 'accept') {
        // Update the challenge status to 'accepted'
        await updateDoc(challengeDocRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
        });

        // Delete the challenge from the collection after accepting it
        await deleteDoc(challengeDocRef);
        console.log(`Challenge accepted and deleted: ${challengeId}`);

        // Navigate both the challenger and challenged to the quiz
        navigate('/cquiz', { state: { selectedQuiz: quiz } });

      } else if (action === 'decline') {
        await updateDoc(challengeDocRef, {
          status: 'declined',
          declinedAt: serverTimestamp(),
        });

        // Optionally, delete the challenge when declined, if you want to clean it up
        await deleteDoc(challengeDocRef);
        console.log(`Challenge declined and deleted: ${challengeId}`);
      }
    } catch (error) {
      console.error("Error handling challenge response: ", error);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner"></div>
        <p>Loading challenges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pending Challenges</h1>
      {challenges.length === 0 ? (
        <p>No pending challenges</p>
      ) : (
        challenges.map((challenge) => (
          <div key={challenge.id} style={styles.challengeContainer}>
            <p>{challenge.challengerUsername} challenged you to the {challenge.quiz}</p>
            <button 
              onClick={() => handleChallengeResponse(challenge.id, 'accept', challenge.quiz)} 
              style={styles.acceptButton}>
              Accept
            </button>
            <button 
              onClick={() => handleChallengeResponse(challenge.id, 'decline')} 
              style={styles.declineButton}>
              Decline
            </button>
          </div>
        ))
      )}
      <button onClick={() => navigate(-1)} style={styles.button}>
        Go Back
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  challengeContainer: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  acceptButton: {
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  declineButton: {
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '15px',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

export default UserChallengesScreen;
