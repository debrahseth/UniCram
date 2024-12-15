import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, deleteDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft, FaHandshake } from 'react-icons/fa';
import logo from "../assets/main.jpg";

const QuizCompleted = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [senderScores, setSenderScores] = useState(null);
  const [receiverScores, setReceiverScores] = useState(null);
  const [isSenderScoreLoaded, setIsSenderScoreLoaded] = useState(false);
  const [isReceiverScoreLoaded, setIsReceiverScoreLoaded] = useState(false);
  const { senderUsername, receiverUsername, challengeId } = location.state || {};

  useEffect(() => {
    const loadScores = () => {
      try {
        if (challengeId) {
          const challengeRef = doc(db, 'challenges', challengeId);
          const scoresRef = collection(challengeRef, 'scores');
          const unsubscribeSender = onSnapshot(doc(scoresRef, 'sender'), (senderDoc) => {
            if (senderDoc.exists()) {
              setSenderScores(senderDoc.data().senderScore);
              setIsSenderScoreLoaded(true);
            } else {
              console.error('Sender score not found in Firestore');
            }
          });
          const unsubscribeReceiver = onSnapshot(doc(scoresRef, 'receiver'), (receiverDoc) => {
            if (receiverDoc.exists()) {
              setReceiverScores(receiverDoc.data().receiverScore);
              setIsReceiverScoreLoaded(true);
            } else {
              console.error('Receiver score not found in Firestore');
            }
          });
          return () => {
            unsubscribeSender();
            unsubscribeReceiver();
          };
        }
      } catch (error) {
        console.error('Error retrieving scores from Firestore:', error);
      }
    };
    const unsubscribe = loadScores();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [challengeId]);

  const resetScoresAndNavigate = async () => {
    try {
      if (challengeId) {
        const challengeRef = doc(db, 'challenges', challengeId);
        const challengeDoc = await getDoc(challengeRef);
        if (challengeDoc.exists()) {
          const scoresRef = collection(challengeRef, 'scores');
          const scoresSnapshot = await getDocs(scoresRef);
          if (!scoresSnapshot.empty) {
            const deletePromises = scoresSnapshot.docs.map((doc) => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log('Scores deleted from "scores" subcollection');
          } else {
            console.log('No scores to delete.');
          }
          await deleteDoc(challengeRef);
          console.log('Challenge deleted from "challenges" collection');
        } else {
          console.log('Challenge not found, skipping deletion.');
        }
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error resetting scores:', error);
    }
  };
  
  const determineWinner = () => {
    if (senderScores > receiverScores) {
      return <h3 style={{fontSize: '20px'}}>{senderUsername} Wins! Congrats {senderUsername}<i className="fa fa-trophy" style={{ marginLeft: '10px' }}></i></h3>;
    } else if (receiverScores > senderScores) {
      return <h3 style={{fontSize: '20px'}}>{receiverUsername} Wins! Congrats {receiverUsername}<i className="fa fa-trophy" style={{ marginLeft: '10px' }}></i></h3>;
    } else {
      return <h3 style={{fontSize: '20px'}}>When Great Minds Meet – A Tie! <FaHandshake/></h3>;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <div style={styles.header}>
          <h1 style={{fontSize: '30px'}}>Quiz Completed!</h1>
        </div>
      </div>
      <div style={styles.headContainer}>
        <div style={styles.head}>
          <h2 style={{fontSize: '26px'}}> Quiz Results</h2>
            <p>{isSenderScoreLoaded && isReceiverScoreLoaded && determineWinner()}</p>
        </div>
      </div>
      <div style={styles.scoresContainer}>
        <div style={styles.contain}>
          <div style={styles.mainContainer}>
          <div style={styles.background}></div>
            <p>
              <h2 style={styles.title}>{senderUsername}'s Score{' '}</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {isSenderScoreLoaded ? (
                      senderScores
                    ) : (
                      <span style={{fontSize: '16px'}}>Loading {senderUsername}'s score...</span>)}
                  </div>
                </div>
            </p>
           </div> 
        </div>
        <div style={styles.contain}>
          <div style={styles.mainContainer}>
          <div style={styles.background}></div>
            <p>
              <h2 style={styles.title}>{receiverUsername}'s Score{' '}</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {isReceiverScoreLoaded ? (
                      receiverScores
                    ) : (
                      <span style={{fontSize: '16px'}}>Loading {receiverUsername}'s score...</span>)}
                  </div>
                </div>
            </p>
          </div>
        </div>
      </div>
        <div style={styles.buttonContainer}>
          <button onClick={resetScoresAndNavigate} style={styles.goBackButton}>
            <FaArrowLeft style={styles.icon} />Go Back to Dashboard
          </button>
        </div>
    </div>
  );
};

const styles = {
  mainContainer: {
    height: "70vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    opacity: 0.5,
    zIndex: -1,
  },
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    height: '95vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    display: 'flex',
    backgroundColor: '#FFD700',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    width: '98%',
    position: 'fixed',
    top: 5,
    flexDirection: 'row',      
  },
  header: {
    width: '100%',
    textAlign: 'center',
  },
  headContainer: {
    display: 'flex',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    width: '96%',
    position: 'fixed',
    top: 100,
    flexDirection: 'row',      
  },
  head: {
    textAlign: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  buttonContainer: {
    width: '100%',
    position: 'fixed',
    bottom: '0',
    left: '0',
    backgroundColor: '#fff',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: '12px 20px',
    fontSize: '20px',
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
  },
  scoresContainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between', 
    width: '100%',
    height: '70vh',
    padding: '5px',
    boxSizing: 'border-box',
  },
  contain: {
    display: 'flex',
    gap: '20px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    padding: '10px',
    flex: 1,   
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '60vh',
    marginTop: '100px',
    marginLeft: '10px',
  },
  title: {
    fontSize: '35px',
    textAlign: 'center',
    marginBottom: '300px',
  },
  miniScoresContainer:{
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    height: '20vh',
    padding: '20px',
    boxSizing: 'border-box',
  },
  miniContain: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,   
    fontWeight: 900,
    fontSize: '100px',
    zIndex: 2,
    opacity: 1,
    flex: 1,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '30vh',
    marginBottom: '200px',
  },
};

export default QuizCompleted;
