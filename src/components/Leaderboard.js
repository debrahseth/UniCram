import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { db } from '../firebase';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import TopRightLogo from './TopRightLogo';
import TopLeftLogo from './TopLeftLogo';

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
      <div style={styles.header}>
        <TopLeftLogo />
        <TopRightLogo />
        <h2>Leaderboard</h2>
      </div>
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
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FaArrowLeft size={20} /> Go Back
        </button>
      </div>
    </div>
  );
};
const styles = {
  container: {
    backgroundColor: '#f4f7fc',
    padding: '5px',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '70px',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 15px',
    fontSize: '16px',
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
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    backgroundColor: '#fff',
    padding: '10px 0',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
};
export default Leaderboard;