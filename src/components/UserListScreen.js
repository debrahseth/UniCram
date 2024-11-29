import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [challengedUserId, setChallengedUserId] = useState('');
  const [challengedUserName, setChallengedUserName] = useState('');
  const [challengeLoading, setChallengeLoading] = useState(false);  // New state for challenge loading
  const [errorMessage, setErrorMessage] = useState('');  // For showing error messages if declined

  const navigate = useNavigate();

  // Fetch users excluding the current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const currentUser = getAuth().currentUser;
        if (!currentUser) {
          setLoading(false);
          return;
        }
        const currentUserDocRef = doc(db, 'users', currentUser.uid);
        const currentUserDoc = await getDoc(currentUserDocRef);
        if (!currentUserDoc.exists()) {
          console.error("Current user document not found.");
          setLoading(false);
          return;
        }
        const currentUserName = currentUserDoc.data().username;
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
        }));
        const filteredUsers = usersList.filter(user => user.username !== currentUserName);
        setUsers(filteredUsers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle the challenge button click
  const handleChallengeClick = (userId, userName) => {
    setChallengedUserId(userId);
    setChallengedUserName(userName);
    setShowQuizModal(true);
  };

  // Handle quiz selection
  const handleQuizSelection = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(false);
    setShowConfirmationModal(true);
  };

  // Handle challenge confirmation
  const handleChallengeConfirmation = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser || !challengedUserId || !selectedQuiz) {
      console.error("Challenge data is missing.");
      return;
    }

    try {
      // Set loading state
      setChallengeLoading(true);

      // Add challenge to Firestore
      const challengeRef = collection(db, 'challenges');
      const challengeDocRef = await addDoc(challengeRef, {
        challengerId: currentUser.uid,
        challengedId: challengedUserId,
        status: 'pending',
        quiz: selectedQuiz,
        createdAt: serverTimestamp(),
      });
      console.log(`Challenge sent to ${challengedUserId} for quiz: ${selectedQuiz}`);

      // Monitor the challenge status
      const unsubscribe = onSnapshot(doc(db, 'challenges', challengeDocRef.id), (docSnapshot) => {
        const challengeData = docSnapshot.data();
        if (challengeData.status === 'accepted') {
          // Challenge accepted, navigate to quiz
          setChallengeLoading(false);
          navigate('/cquiz', { state: { selectedQuiz } });
        } else if (challengeData.status === 'declined') {
          // Challenge declined, show error message
          setChallengeLoading(false);
          setErrorMessage(`${challengedUserName} has declined the challenge.`);
        }
      });

      // Stop listening once the challenge is processed
      setTimeout(() => unsubscribe(), 10000);  // Automatically stop after 10 seconds

      setShowConfirmationModal(false);
    } catch (error) {
      console.error("Error sending challenge: ", error);
      setChallengeLoading(false);
      setErrorMessage("Error sending challenge.");
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner"></div>
        <p>Loading...</p>
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
      <h1 style={styles.title}>Users</h1>
      <div>
        {users.map((user) => (
          <div key={user.id} style={styles.userContainer}>
            <p style={styles.userName}>{user.username}</p>
            <button
              onClick={() => handleChallengeClick(user.id, user.username)}
              style={styles.challengeButton}
            >
              Challenge
            </button>
          </div>
        ))}
      </div>
      {showQuizModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Select a Quiz</h2>
            <button onClick={() => handleQuizSelection('Math Quiz')}>Math Quiz</button>
            <button onClick={() => handleQuizSelection('Science Quiz')}>Science Quiz</button>
            <button onClick={() => handleQuizSelection('History Quiz')}>History Quiz</button>
            <button onClick={() => setShowQuizModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {showConfirmationModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Confirm Challenge</h2>
            <p>Are you sure you want to challenge {challengedUserName} to the {selectedQuiz}?</p>
            <button onClick={handleChallengeConfirmation}>Confirm</button>
            <button onClick={() => setShowConfirmationModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      {challengeLoading && (
        <div style={styles.loaderContainer}>
          <div className="spinner"></div>
          <p>Waiting for challenge response...</p>
        </div>
      )}
      {errorMessage && (
        <div style={styles.errorMessage}>
          <p>{errorMessage}</p>
        </div>
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
  userContainer: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: '18px',
  },
  challengeButton: {
    padding: '5px 10px',
    fontSize: '14px',
    cursor: 'pointer',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  errorMessage: {
    padding: '10px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '4px',
    textAlign: 'center',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
};

export default UserListScreen;
