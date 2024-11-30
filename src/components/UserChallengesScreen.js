import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UserChallengesScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Function to fetch the challenger's username
  const fetchChallengerUsername = async (challengerId) => {
    console.log('Fetching username for challengerId:', challengerId);
    try {
      const userDocRef = doc(db, 'users', challengerId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const username = userDoc.data().username;
        console.log(`Fetched challenger username: ${username}`);  // Log the username
        return username;
      } else {
        console.log('Challenger username not found, returning "Unknown"');
        return 'Unknown';
      }
    } catch (error) {
      console.error('Error fetching challenger username:', error);
      return 'Unknown';
    }
  };

  // Effect hook to listen for real-time challenges
  useEffect(() => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.log('No logged-in user found.');
      setLoading(false);
      return;
    }

    console.log('Logged-in user:', currentUser.uid);  // Log current user's UID

    try {
      // Query for pending challenges where current user is the 'challenged'
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('challengedId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );

      // Set up a real-time listener for challenges collection
      const unsubscribe = onSnapshot(challengesQuery, async (snapshot) => {
        console.log('Challenges updated:', snapshot.docs.length);  // Log the number of challenges updated

        const challengesList = [];
        for (let docSnap of snapshot.docs) {
          const challengeData = docSnap.data();
          console.log('Challenge data:', challengeData);  // Log the challenge data

          // Fetch the challenger's username
          const challengerUsername = await fetchChallengerUsername(challengeData.challengerId);
          challengesList.push({
            id: docSnap.id,
            challengerUsername,
            ...challengeData,
          });
        }
        setChallenges(challengesList);
        setLoading(false);
      });

      // Cleanup the listener when the component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.error("Error in useEffect:", error);  // Log any errors in the useEffect
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Handling response to a challenge (accept/decline)
  const handleChallengeResponse = async (challengeId, action, quiz) => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) {
      console.error("No logged-in user found.");
      return;
    }

    try {
      const challengeDocRef = doc(db, 'challenges', challengeId);
      if (action === 'accept') {
        await updateDoc(challengeDocRef, {
          status: 'accepted',
          acceptedAt: serverTimestamp(),
        });
        const challengeDoc = await getDoc(challengeDocRef);
        const challengeData = challengeDoc.data();
        console.log('Navigating to /cquiz with quiz:', quiz, 'and users:', [challengeData.challengerId, challengeData.challengedId]);

        // Navigate to quiz screen with challenge data
        navigate('/cquiz', {
          state: {
            selectedQuiz: quiz,
            challengeId,
            users: [challengeData.challengerId, challengeData.challengedId],
          },
        });
        await deleteDoc(challengeDocRef);
        console.log(`Challenge accepted and deleted: ${challengeId}`);
      } else if (action === 'decline') {
        await updateDoc(challengeDocRef, {
          status: 'declined',
          declinedAt: serverTimestamp(),
        });
        await deleteDoc(challengeDocRef);
        console.log(`Challenge declined and deleted: ${challengeId}`);
      }
    } catch (error) {
      console.error("Error handling challenge response: ", error);
    }
  };

  // Loading state and error handling
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

  // Main UI rendering
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
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

export default UserChallengesScreen;
