import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDoc, updateDoc, doc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { FaCheck, FaTimes, FaArrowCircleLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo1.jpg';

const ChallengesReceivedScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [password, setPassword] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const correctPassword = "BrainSnacks123";

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setCurrentUserId(currentUser.uid);
        }
        if (currentUserId) {
          const challengesQuery = query(
            collection(db, 'challenges'),
            where('receiverId', '==', currentUserId),
            where('status', '==', 'pending')
          );
          const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
            const challengeList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setChallenges(challengeList);
            challengeList.forEach((challenge) => {
                if (!usernames[challenge.senderId]) {
                  fetchUsername(challenge.senderId);
                }
              });
          });
          return () => unsubscribe();
        }
      }, [currentUserId]);

      const fetchUsername = async (userId) => {
        try {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUsernames((prevUsernames) => ({
              ...prevUsernames,
              [userId]: userSnap.data().username,
            }));
          } else {
            console.error('User not found:', userId);
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      };

      const handleAcceptChallenge = async (challengeId, senderId, receiverId) => {
        try {
          const challengeRef = doc(db, 'challenges', challengeId);
          await updateDoc(challengeRef, {
            status: 'accepted',
          });
          console.log('Challenge accepted!');
          if (senderId && receiverId) {
            const receiverRef = doc(db, 'users', receiverId);
            await updateDoc(receiverRef, { status: 'busy' });
            navigate(`/Quiz/${challengeId}?sender=${senderId}&receiver=${receiverId}`);
          } else {
            console.error("Sender or receiver ID is missing!");
          }
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

  const deleteQuizScores = async (challengeDocId) => {
    const quizScoresRef = collection(db, 'challenges', challengeDocId, 'scores');
    const quizScoresSnapshot = await getDocs(quizScoresRef);
    quizScoresSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  };
  const deleteChallenges = async () => {
    const challengesRef = collection(db, 'challenges');
    const challengesSnapshot = await getDocs(challengesRef);
    challengesSnapshot.forEach(async (doc) => {
      await deleteQuizScores(doc.id);
      await deleteDoc(doc.ref);
    });
  };
  const handleResetChallenges = async () => {
    if (password === correctPassword) {
    try {
      await deleteChallenges();
      setPassword('');
      setShowPasswordPrompt(false);
      alert('Challenges have been reset');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error resetting challenges:', error);
    }
  } else {
    setPasswordError('Incorrect password. Please try again.');
  }
  };

  const handleShowPasswordPrompt = () => {
    setShowPasswordPrompt(true);
    setPasswordError('');
  };

  return (
    <div style={styles.container}>
        <div style={styles.background}></div>
        <div style={styles.header}>
            <div style={styles.buttonContainer}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    <FaArrowCircleLeft size={20} /> Go Back
                </button>
            </div>
            <div style={styles.buttonContain}>
                <button onClick={() => navigate("/challenge")} style={styles.backButton}>
                    <i className="fa fa-rocket"></i>Send Challenges
                </button>
            </div>
            <h1 style={{fontSize: "40px",textAlign: "center",display: "flex",justifyContent: "center",alignItems: "center"}}>Challenges</h1>
        </div>
        <div style={styles.scrollableContainer}>
      {challenges.length === 0 ? (
        <p style={styles.noDataContainer}>No challenges at the moment.</p>
      ) : (
        challenges.map((challenge) => (
          <div key={challenge.id}>
            <div style={styles.content}>
            <h3 style={styles.title}>{challenge.course} - {challenge.difficulty}</h3>
            <p style={styles.subtitle}>Challenge sent by: {usernames[challenge.senderId] || 'Loading...'}</p>
              <button onClick={() => handleAcceptChallenge(challenge.id, challenge.senderId, currentUserId)} style={styles.acceptButton}>
                <FaCheck style={{ marginRight: '8px' }} />
                Accept
              </button>
              <button onClick={() => handleDeclineChallenge(challenge.id)} style={styles.declineButton}>
                <FaTimes style={{ marginRight: '8px' }} />
                Decline
              </button>
            </div>
          </div>
        ))
      )}
      </div>
      <div style={styles.buttonContainment}>
        <button onClick={handleShowPasswordPrompt} style={styles.resetButton}>
          Reset the Challenges
        </button>
      </div>
      {showPasswordPrompt && (
        <div style={styles.passwordPromptContainer}>
          <h3 style={{textAlign: "center"}}>Enter Password to Confirm Reset</h3>
          <div style={styles.inputGroup}>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="ENTER PASSWORD TO RESET"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
            />
            <button
              type="button"
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={styles.toggleButton}
            >
              <i className={`fa ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            {passwordError && <p style={styles.errorText}>{passwordError}</p>}
          </div>
          <button onClick={handleResetChallenges} style={styles.confirmButton}>
            Confirm Reset
          </button>
          <button onClick={() => setShowPasswordPrompt(false)} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

const styles ={
    container:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
    },
    background: {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${logo})`, 
        backgroundPosition: 'center', 
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        opacity: 0.5,
        zIndex: -1,
    },
    header: {
        width: '95%',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#FFD700',
        padding: '20px',
        top: '10px',
        borderRadius: '8px 8px 10px 10px',
        position: 'relative',
        zIndex: 1,
        opacity: 0.8,
    },
    backButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "10px 15px",
        fontSize: "25px",
        margin: '10px',
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "background-color 0.3s",
    },
    buttonContainer: {
        position: "absolute",
        top: "40px",
        left: "20px",
    },
    buttonContain: {
        position: "absolute",
        top: "40px",
        right: "20px",
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '15px',
    },
    noDataContainer:{
        fontSize: '36px',
        color: '#000000',
        fontWeight: 900,
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '20px',
        opacity: '0.8',
        width: '95%',
        padding: '30px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    title:{
        fontSize: '30px',
    },
    subtitle:{
        fontSize: '25px',
        fontWeight: 700,
    },
    content: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '95%',
        padding: '20px',
        marginLeft: '10px',
        zIndex: 2,
        opacity: 0.9,
        flex: 1,  
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',      
    },
    acceptButton:{
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
    },
    declineButton:{
        padding: '10px 20px',
        backgroundColor: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
    },
    scrollableContainer:{
        flex: 1,     
        marginTop: '20px',      
        marginBottom: '10px',      
        justifyContent: 'center',   
        overflowY: 'auto',
        opacity: '0.9',
        width: '100%'
    },
    buttonContainment: {
      width: '100%',
      position: 'fixed',
      bottom: '0',
      left: '0',
      boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    resetButton: {
      backgroundColor: '#2196F3',
      color: 'white',
      padding: '12px 20px',
      fontSize: '25px',
      fontWeight: '900',
      cursor: 'pointer',
      borderRadius: '10px',
      border: 'none',
      marginTop: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%',
      opacity: '0.8'
    },
    passwordPromptContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      flexDirection: 'column'
    },
  passwordInput: {
    padding: '10px',
    fontSize: '16px',
    width: '300px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    outline: 'none',
    transition: 'border-color 0.3s',
    },
  toggleButton: {
    position: 'absolute',
    right: '5px',
    top: '42%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '20px',
  },
    confirmButton: {
      backgroundColor: 'green',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginLeft: '10px',
    },
    cancelButton: {
      backgroundColor: 'red',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginLeft: '10px',
    },
    errorText: {
      color: 'red',
      fontSize: '14px',
    },
}

export default ChallengesReceivedScreen;
