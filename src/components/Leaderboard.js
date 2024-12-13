import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowCircleLeft } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import logo from '../assets/main.jpg';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({});
  const [usersData, setUsersData] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserData = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const users = {};
      userSnapshot.forEach(doc => {
        const data = doc.data();
        users[doc.id] = data.username;
      });
      setUsersData(users);
    };
    const unsubscribe = onSnapshot(collection(db, 'scores'), (querySnapshot) => {
      const scores = querySnapshot.docs.map(doc => doc.data());
      const groupedBySubject = scores.reduce((acc, score) => {
        const subject = score.subject;
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push(score);
        return acc;
      }, {});
      for (const subject in groupedBySubject) {
        groupedBySubject[subject].sort((a, b) => b.score - a.score);
      }
      const leaderboardWithUsernames = {};
      for (const subject in groupedBySubject) {
        leaderboardWithUsernames[subject] = groupedBySubject[subject].map(score => ({
          ...score,
          username: usersData[score.userId] || 'No Name',
        }));
      }
      setLeaderboardData(leaderboardWithUsernames);
    });
    fetchUserData();
    return () => unsubscribe();
  }, [usersData]);
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
          <button onClick={() => navigate('/record')} style={styles.backButton}>
            <i class="fa fa-trophy"></i>My Records
          </button>
        </div>
        <h2 style={{fontSize: '36px'}}>Leaderboard</h2>
      </div>
      <div style={styles.scrollableContainer}>
      {Object.keys(leaderboardData).length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={styles.noDataMessage}>No leaderboard data available.</p>
        </div>
      ) : (
        <div>
          {Object.keys(leaderboardData).map((subject, index) => (
            <div key={index} style={styles.courseContainer}>
              <h3>{subject}</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.tableHeaderCell}>Rank</th>
                    <th style={styles.tableHeaderCell}>Name</th>
                    <th style={styles.tableHeaderCell}>Score</th>
                    <th style={styles.tableHeaderCell}>Total Questions</th>
                    <th style={styles.tableHeaderCell}>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData[subject].map((user, idx) => (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.tableCell}>{idx + 1}</td>
                      <td style={styles.tableCell}>{user.username || 'No Name'}</td>
                      <td style={styles.tableCell}>{user.score}</td>
                      <td style={styles.tableCell}>{user.totalQuestions}</td>
                      <td style={styles.tableCell}>{user.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
      </div>
        <div style={styles.footer}>
          <p>© 2025 StudyGroup. All rights reserved.</p>
        </div>
    </div>
  );
};
const styles = {
  container: {
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
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
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px',
    textAlign: 'center',
    zIndex: 10,
    opacity: '0.7',
  },
  scrollableContainer: {
    marginTop: '100px',
    flex: 1,         
    overflowY: 'auto',
    padding: '20px',
    opacity: '0.9',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    fontSize: '25px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  tableHeader: {
    backgroundColor: '#4CAF50',
    color: 'white',
    textAlign: 'left',
  },
  tableHeaderCell: {
    padding: '10px',
    fontSize: '18px',
  },
  tableRow: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #ddd',
  },
  tableCell: {
    padding: '20px',
    fontSize: '18px',
    textAlign: 'left',
  },
  noDataContainer: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    marginTop: '300px',
    marginBottom: '50px',
  },
  noDataMessage: {
    fontSize: '18px',
    color: '#555',
  },
  courseContainer: {
    marginBottom: '40px',
  },
  buttonContainer: {
  position: 'absolute',
    top: '40px',
    left: '20px',
  },
  buttonContain: {
    position: 'absolute',
      top: '40px',
      right: '20px',
    },
  footer: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    padding: '15px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontFamily: 'Poppins, sans-serif',
  },
};
export default Leaderboard;