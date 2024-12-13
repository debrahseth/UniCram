import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/main.jpg';

const PersonalRecords = () => {
  const [quizRecords, setQuizRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const navigate = useNavigate();

  const calculateRating = (score, totalQuestions) => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage >= 90) return 5;
    if (percentage >= 80) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 40) return 2;
    return 1;
  };
  const calculateOverallRating = (totalScore, totalQuestions) => {
    if (totalQuestions === 0) return 0;
    const averageScore = (totalScore / totalQuestions) * 100;
    return calculateRating(averageScore, 100);
  };

  useEffect(() => {
    const fetchQuizRecords = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        try {
          const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
          const unsubscribe = onSnapshot(quizScoresRef, (querySnapshot) => {
          const records = querySnapshot.docs.map((doc) => doc.data());
          let totalScore = 0;
          let totalQuestions = 0;
          records.forEach((record) => {
            totalScore += record.score;
            totalQuestions += record.totalQuestions;
          });
          const overall = calculateOverallRating(totalScore, totalQuestions);
          setOverallRating(overall);
          setQuizRecords(records);
          setLoading(false);
        });
        return() => unsubscribe();
        } catch (error) {
          console.error('Error fetching quiz scores:', error);
        } 
      } else {
        navigate('/login');
      }
    };

    fetchQuizRecords();
    return () => {
        setLoading(true);
      };
  }, [navigate]);

  const resetQuizScores = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
        const querySnapshot = await getDocs(quizScoresRef);
        const confirmReset = window.confirm('Are you sure you want to delete all your quiz scores? This action cannot be undone.');

        if (confirmReset) {
          const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
          await Promise.all(deletePromises);

          setQuizRecords([]);
          console.log('All quiz scores have been deleted.');
        }
      } catch (error) {
        console.error('Error deleting quiz scores:', error);
      }
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
    <div style={styles.background}></div>
    <div style={styles.title}>
      <h2>Your Quiz Records</h2>
        <div style={styles.ratingcontainer}>
            <p style={styles.recordDetails1}>Overall Rating:
                {Array.from({ length: 5 }, (_, i) => (
                <span key={i} style={i < overallRating ? styles.filledStar1 : styles.emptyStar1}>
                &#9733;
                </span>
            ))}</p>
        </div>
    </div>
    <div style={styles.content}>
      {quizRecords.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={{fontSize: '25px'}}>No quiz records available.</p>
        </div>
      ) : (
        <div style={styles.recordsContainer}>
          {quizRecords.map((record, index) => {
            const rating = calculateRating(record.score, record.totalQuestions);
            return (
            <div key={index} style={styles.recordCard}>
              <h3 style={styles.quizName}>{record.subject}</h3>
              <p style={styles.recordDetails}>Difficulty: {record.difficulty}</p>
              <p style={styles.recordDetails}>Score: {record.score}/{record.totalQuestions}</p>
              <p style={styles.recordDetails}>Date Taken: {record.dateTaken ? new Date(record.dateTaken.seconds * 1000).toLocaleString() : 'N/A'}</p>
              <div style={styles.starRating}>
              <p style={styles.recordDetails}>Rating: {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={i < rating ? styles.filledStar : styles.emptyStar}>
                      &#9733;
                    </span>
                  ))}</p>
                </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
        <div style={styles.button}>
        <div style={styles.buttonContainer}>
            <button onClick={() => navigate(-1)} style={styles.backButton}>Go Back</button>
            <button onClick={resetQuizScores} style={styles.resetButton}>Reset All Scores</button>
        </div>
        </div>
    </div>
  );
};

const styles = {
  container: {
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
title: {
    fontSize: '25px',
    marginBottom: '10px',
    color: '#333',
    width: '100%',
    padding: '10px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
    zIndex: 1,
  },
  noDataContainer: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '20px',
    marginTop: '10px',
    zIndex: 2,
    opacity: 0.9,
    flex: 1,         
    overflowY: 'auto',
  },
  recordsContainer: {
    width: '96%',
    flex: 1,         
    overflowY: 'auto',
    padding: '20px',
    opacity: '0.9',
    marginBottom: '50px'
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  quizName: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '10px',
  },
  ratingcontainer: {
    textAlign: 'center',
    backgroundColor: 'white',
    width: '100%',
    borderRadius: '20px',
    flexDirection: 'column',
    flex: 1, 
    display: 'flex',
  },
  recordDetails: {
    fontSize: '16px',
    color: '#555',
  },
  starRating: {
    display: 'flex',
    marginTop: '10px',
  },
  filledStar: {
    color: '#FFD700',
    fontSize: '20px',
  },
  emptyStar: {
    color: '#D3D3D3',
    fontSize: '20px',
  },
  filledStar1: {
    color: '#FFD700',
    fontSize: '50px',
  },
  emptyStar1: {
    color: '#D3D3D3',
    fontSize: '50px',
  },
  recordDetails1: {
    fontSize: '25px',
    color: '#555',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    width: '40%',
    zIndex: 2,
  },
  resetButton: {
    backgroundColor: '#FF4C4C',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    width: '40%',
    zIndex: 2,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly', 
    alignItems: 'center', 
    gap: '20px',        
    width: '80%',          
    margin: '0 auto',
    zIndex: 2,      
  },
  button: {
    position: 'fixed',
    bottom: '0',
    padding: '10px',
    display: 'flex',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    width: '90%',
    marginBottom: '10px',
    flexDirection: 'row',
    zIndex: 2,
  }
};

export default PersonalRecords;
