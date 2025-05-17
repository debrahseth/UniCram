import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const StreakTracker = () => {
  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [lastQuizDate, setLastQuizDate] = useState(null);
  const [streakMessage, setStreakMessage] = useState('');
  const [quizRecords, setQuizRecords] = useState([]);

  const updateStreak = (records) => {
    if (!records || records.length === 0) {
      setStreak(0);
      setLastQuizDate(null);
      setStreakMessage('');
      return;
    }

    const sortedRecords = [...records].sort((a, b) => a.dateTaken.seconds - b.dateTaken.seconds);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let currentStreak = 0;
    let lastDate = null;
    let streakBroken = false;

    const dates = [...new Set(sortedRecords.map(record => {
      const date = new Date(record.dateTaken.seconds * 1000);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }))].sort();

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(dates[i - 1]);
        const diffDays = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      lastDate = currentDate;
    }

    const daysSinceLastQuiz = lastDate ? (today - lastDate) / (1000 * 60 * 60 * 24) : Infinity;
    if (daysSinceLastQuiz > 1) {
      currentStreak = 0;
      streakBroken = true;
    }

    setStreak(currentStreak);
    setLastQuizDate(lastDate ? lastDate.toISOString() : null);

    if (streakBroken && currentStreak === 0 && streak > 0) {
      setStreakMessage('Your streak melted! Start a new one today!');
      setTimeout(() => setStreakMessage(''), 3000);
    }
  };

  useEffect(() => {
    if (user && streak !== null && lastQuizDate !== undefined) {
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, { 
        streak, 
        lastQuizDate: lastQuizDate ? lastQuizDate : null 
      }, { merge: true })
    }
  }, [user, streak, lastQuizDate]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
        const unsubscribeSnapshot = onSnapshot(quizScoresRef, (querySnapshot) => {
          const records = querySnapshot.docs.map((doc) => doc.data());
          setQuizRecords(records);
          updateStreak(records);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setQuizRecords([]);
        setStreak(0);
        setLastQuizDate(null);
        setStreakMessage('');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div style={styles.header}>
      <div style={styles.streakContainer}>
        <span style={styles.streakIcon}>🔥</span>
        <span style={styles.streakText}>Streak: {streak} {streak === 1 ? 'Day' : 'Days'}</span>
      </div>
      {streakMessage && (
        <div style={styles.streakMessage}>
          {streakMessage}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    position: 'absolute',
    top: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    alignItems: 'center',
    zIndex: 3,
  },
  streakContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 10px',
    borderRadius: '5px',
    boxShadow: '0 8px 10px rgba(0, 0, 0, 0.5)',
    border: '2px solid white'
  },
  streakIcon: {
    fontSize: '25px',
    marginRight: '5px',
  },
  streakText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FF4500',
    marginRight: '5px',
  },
  streakMessage: {
    position: 'absolute',
    top: '50px',
    right: '10px',
    backgroundColor: '#FF6347',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 4,
  },
};

export default StreakTracker;