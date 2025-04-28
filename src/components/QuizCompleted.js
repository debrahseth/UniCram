import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
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
  const [winner, setWinner] = useState(null); // New state to track the winner
  const { senderUsername, receiverUsername, challengeId } = location.state || {};

  const handleLeavePage = () => {
    speechSynthesis.cancel();
    navigate("/dashboard");
  };
  
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
            }
          });
          const unsubscribeReceiver = onSnapshot(doc(scoresRef, 'receiver'), (receiverDoc) => {
            if (receiverDoc.exists()) {
              setReceiverScores(receiverDoc.data().receiverScore);
              setIsReceiverScoreLoaded(true);
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

  // Add useEffect to determine the winner and trigger voice announcement
  useEffect(() => {
    if (isSenderScoreLoaded && isReceiverScoreLoaded) {
      let winnerName = null;
      let loserName = null;
      if (senderScores > receiverScores) {
        winnerName = senderUsername;
        loserName = receiverUsername;
        setWinner('sender');
      } else if (receiverScores > senderScores) {
        winnerName = receiverUsername;
        loserName = senderUsername;
        setWinner('receiver');
      } else {
        setWinner('tie');
      }

      if (winnerName) {
        const utterance = new SpeechSynthesisUtterance(`Congratulations ${winnerName}! You did an amazing job and came out on top!. ${loserName}, don't worry, — every great champion started with a few setbacks. Keep pushing, your moment is coming soon!. Congrats to you all!.`);
        utterance.lang = 'en-US';
        utterance.volume = 1;
        utterance.rate = 1;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    }
  }, [isSenderScoreLoaded, isReceiverScoreLoaded, senderScores, receiverScores, senderUsername, receiverUsername]);

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
          {isSenderScoreLoaded && isReceiverScoreLoaded && determineWinner()}
        </div>
      </div>
      <div style={styles.scoresContainer}>
        <div style={styles.contain}>
          <div style={{ ...styles.mainContainer, ...(winner === 'sender' ? styles.winnerContainer : {}) }}>
            <div style={styles.background}></div>
              <h2 style={styles.title}>{senderUsername}'s Score{' '}</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {isSenderScoreLoaded ? (
                      senderScores
                    ) : (
                      <span style={{fontSize: '16px'}}>Loading {senderUsername}'s score...</span>)}
                  </div>
                </div>
          </div> 
        </div>
        <div style={styles.contain}>
          <div style={{ ...styles.mainContainer, ...(winner === 'receiver' ? styles.winnerContainer : {}) }}>
          <div style={styles.background}></div>
              <h2 style={styles.title}>{receiverUsername}'s Score{' '}</h2>
                <div style={styles.miniScoresContainer}>
                  <div style={styles.miniContain}>
                    {isReceiverScoreLoaded ? (
                      receiverScores
                    ) : (
                      <span style={{fontSize: '16px'}}>Loading {receiverUsername}'s score...</span>)}
                  </div>
                </div>
          </div>
        </div>
      </div>
        <div style={styles.buttonContainer}>
          <button onClick={handleLeavePage} style={styles.goBackButton}>
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
  winnerContainer: { // New style for the winner's container animation
    animation: 'celebrate 2s infinite',
    border: '3px solid transparent',
    background: 'linear-gradient(white, white) padding-box, linear-gradient(45deg, #FFD700, #FF4500, #FFD700) border-box',
    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
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
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
    height: '30vh',
    marginBottom: '200px',
  },
};

// Add CSS keyframes for the celebration animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
  @keyframes celebrate {
    0% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
    50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 69, 0, 0.7); }
    100% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
  }
`;
document.head.appendChild(styleSheet);

export default QuizCompleted;