import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import quizData from '../assets/quizData';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [challengedUserId, setChallengedUserId] = useState('');
  const [challengedUserName, setChallengedUserName] = useState('');
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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

  const handleChallengeClick = (userId, userName) => {
    setChallengedUserId(userId);
    setChallengedUserName(userName);
    setShowQuizModal(true);
  };

  const handleQuizSelection = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(false);
    setShowConfirmationModal(true);
  };

  const handleChallengeConfirmation = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser || !challengedUserId || !selectedQuiz) {
      console.error("Challenge data is missing.");
      return;
    }
    try {
      setChallengeLoading(true);
      const challengeRef = collection(db, 'challenges');
      const challengeDocRef = await addDoc(challengeRef, {
        challengerId: currentUser.uid,
        challengedId: challengedUserId,
        status: 'pending',
        quiz: selectedQuiz,
        createdAt: serverTimestamp(),
      });

      console.log(`Challenge sent to ${challengedUserId} for quiz: ${selectedQuiz}`);

      const unsubscribe = onSnapshot(doc(db, 'challenges', challengeDocRef.id), (docSnapshot) => {
        const challengeData = docSnapshot.data();
        if (challengeData.status === 'accepted') {
          setChallengeLoading(false);
          navigate('/cquiz', { state: { selectedQuiz, challengeId: challengeDocRef.id, users: [currentUser.uid, challengedUserId] } });
        } else if (challengeData.status === 'declined') {
          setChallengeLoading(false);
          setErrorMessage(`${challengedUserName} has declined the challenge.`);
        }
      });
      setTimeout(() => unsubscribe(), 10000);

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
            <div style={styles.quizContainer}>
            <ul style={styles.quizList}>
              {Object.keys(quizData).map((quiz, index) => (
                <li key={index} style={styles.quizListItem}>
                  <button onClick={() => handleQuizSelection(quiz)} style={styles.quizButton}>
                    {quiz}
                  </button>
                </li>
              ))}
            </ul>
            </div>
            <button onClick={() => setShowQuizModal(false)} style={styles.button}>Cancel</button>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.Modal}>
            <h2>Confirm Challenge</h2>
            <p>Are you sure you want to challenge {challengedUserName} to the {selectedQuiz}?</p>
            <button onClick={handleChallengeConfirmation} style={styles.button}>Confirm</button>
            <button onClick={() => setShowConfirmationModal(false)} style={styles.button}>Cancel</button>
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

      <button onClick={() => navigate(-1)} style={styles.button}>Go Back</button>
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
  quizContainer: {
    height: '300px',
    overflowY: 'auto',
    marginBottom: '20px',
  },
  quizList: {
    listStyleType: 'none',
    padding: '0',
    marginTop: '20px',
  },
  quizListItem: {
    marginBottom: '10px',
  },
  quizButton: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#008CBA',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    width: '100%',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
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
    width: '100%',
  },
  modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    width: '90%',
    height: '450px'
  },
  Modal: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    width: '90%',
  },
};

export default UserListScreen;
