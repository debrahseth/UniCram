import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const DailyChallenges = () => {
  const [user, setUser] = useState(null);
  const [quizRecords, setQuizRecords] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [bonusPoints, setBonusPoints] = useState(0);
  const subjects = [
  ];

  const generateDailyChallenges = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];
    const numChallenges = Math.floor(Math.random() * 2) + 2;
    const shuffledSubjects = subjects.sort(() => 0.5 - Math.random());
    const selectedSubjects = shuffledSubjects.slice(0, numChallenges);

    const newChallenges = selectedSubjects.map(subject => ({
      subject,
      goal: Math.floor(Math.random() * 3) + 2,
      completed: 0,
      date: todayKey,
      isCompleted: false,
    }));

    setChallenges(newChallenges);

    if (user) {
      const userDocRef = doc(db, 'scores', user.uid);
      setDoc(userDocRef, { dailyChallenges: newChallenges, lastChallengeDate: todayKey }, { merge: true });
    }
  };

  const updateChallengeProgress = (records) => {
    if (!records || records.length === 0 || !challenges.length) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().split('T')[0];
    const todayRecords = records.filter(record => {
      const recordDate = new Date(record.dateTaken.seconds * 1000);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.toISOString().split('T')[0] === todayKey;
    });
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.isCompleted) return challenge;

      const subjectRecords = todayRecords.filter(record => record.subject === challenge.subject);
      const completed = subjectRecords.length;

      if (completed >= challenge.goal && !challenge.isCompleted) {
        const pointsToAdd = 10;
        setBonusPoints(prev => {
          const newPoints = prev + pointsToAdd;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            setDoc(userDocRef, { bonusPoints: newPoints }, { merge: true });
          }
          return newPoints;
        });
        return { ...challenge, completed, isCompleted: true };
      }

      return { ...challenge, completed };
    });

    setChallenges(updatedChallenges);

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, { dailyChallenges: updatedChallenges }, { merge: true });
    }
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBonusPoints(userData.bonusPoints || 0);

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayKey = today.toISOString().split('T')[0];

          if (userData.lastChallengeDate !== todayKey || !userData.dailyChallenges) {
            generateDailyChallenges();
          } else {
            setChallenges(userData.dailyChallenges);
          }
        } else {
          generateDailyChallenges();
        }
        const quizScoresRef = collection(db, 'users', currentUser.uid, 'quizScores');
        const unsubscribeSnapshot = onSnapshot(quizScoresRef, (querySnapshot) => {
          const records = querySnapshot.docs.map((doc) => doc.data());
          setQuizRecords(records);
          updateChallengeProgress(records);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, [user, challenges.length]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Daily Challenges</h3>
      <p style={styles.bonusPoints}>Bonus Points: {bonusPoints}</p>
      {challenges.map((challenge, index) => (
        <div key={index} style={styles.challengeCard}>
          <p style={styles.challengeText}>
            Answer {challenge.goal} {challenge.subject} quizzes today!
            {challenge.isCompleted && <span style={styles.completedText}> - Completed! 🎉</span>}
          </p>
          <div style={styles.progressBarContainer}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${Math.min((challenge.completed / challenge.goal) * 100, 100)}%`,
                backgroundColor: challenge.isCompleted ? '#34D399' : '#3B82F6',
              }}
            />
          </div>
          <p style={styles.progressText}>
            {challenge.completed}/{challenge.goal}
          </p>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: '60px',
    left: '10px',
    width: '300px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    zIndex: 3,
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  bonusPoints: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: '10px',
  },
  challengeCard: {
    marginBottom: '15px',
  },
  challengeText: {
    fontSize: '14px',
    color: '#555',
    marginBottom: '5px',
  },
  completedText: {
    color: '#34D399',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: '10px',
    backgroundColor: '#e0e0e0',
    borderRadius: '5px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.3s ease-in-out',
  },
  progressText: {
    fontSize: '12px',
    color: '#777',
    textAlign: 'right',
    marginTop: '5px',
  },
};

export default DailyChallenges;