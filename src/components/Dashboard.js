import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const quotes = [
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "The best way to predict the future is to create it.", author: "Abraham Lincoln" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Don’t wait for opportunity. Create it.", author: "Anonymous" },
  ];

  const studyTips = [
    "Consistency is key to mastering new skills. Small daily efforts lead to big progress over time.",
    "Never be afraid to ask for help. Collaborating with others can open up new ways of learning.",
    "Stay organized! Keeping track of your tasks and goals can reduce stress and increase productivity.",
    "Don’t be afraid of failure – it’s a stepping stone to success. Learn from mistakes and keep improving.",
    "Make learning fun! Try gamifying your study sessions to make them more enjoyable and engaging."
  ];

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          } else {
            setUsername(currentUser.displayName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);  // Rotate through quotes
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/leaderboard')} style={styles.leaderboardButton}>
          <i className="fa fa-trophy" style={styles.icon}></i>
        </button>
        <h2>Welcome, {username || 'User'}!</h2>
        <button onClick={() => navigate('/profile')} style={styles.profileButton}>
          <i className="fa fa-user" style={styles.icon}></i>
        </button>
      </div>
      <div style={styles.content}>
        <div style={styles.motivationalQuotes}>
        <h3>Motivational Quotes</h3>
          <div style={styles.quoteCard}>
            <p style={styles.quoteText} className="quote-text">
              "{quotes[currentQuoteIndex].text}"
            </p>
            <p style={styles.quoteAuthor}>- {quotes[currentQuoteIndex].author}</p>
          </div>
        </div>
        <div style={styles.studyTips}>
          <h3>Study Tips for Success</h3>
          <ul style={styles.tipsList}>
            {studyTips.map((tip, index) => (
              <li key={index} style={styles.tipItem}>{tip}</li>
            ))}
          </ul>
        </div>

        <button onClick={() => navigate('/quiz')} style={styles.startQuizButton}>Start a Quiz</button>
      </div>
      <div style={styles.footerStyle}>
        <p>© 2025 StudyGroup. All rights reserved.</p>
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
    backgroundColor: '#f4f7fc',
    padding: '20px',
    marginTop: '40px'
  },
  footerStyle: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '10px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.9rem',
  },
  header: {
    width: '100%',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '800px',
    padding: '20px',
    marginTop: '20px',
  },
  motivationalQuotes: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '20px',
  },
  quoteCard: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: '15px',
    backgroundColor: '#f0f8ff',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    opacity: 1,
    transition: 'opacity 1s ease-in-out',
  },
  quoteText: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px',
    opacity: 1,
    transition: 'opacity 1s ease-in-out',
  },
  quoteAuthor: {
    fontSize: '16px',
    color: '#555',
  },
  studyTips: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px',
    marginBottom: '20px',
  },
  tipsList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
    color: '#333',
    fontSize: '16px',
  },
  tipItem: {
    marginBottom: '10px',
  },
  startQuizButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '15px 30px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '8px',
    border: 'none',
    marginTop: '20px',
    transition: 'background-color 0.3s',
  },
  icon: {
    marginRight: '8px',
  },
  leaderboardButton: {
    position: 'absolute',
    left: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  profileButton: {
    position: 'absolute',
    right: '20px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
};

export default Dashboard;
