import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const SplashScreen = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };
    fetchUserInfo();
    const timer = setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      {loading ? (
        <>
          <div style={styles.iconContainer}>
            <div style={styles.dotContainer}>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
              <span style={styles.dot}></span>
            </div>
          </div>
          <h2 style={styles.greeting}>{getGreeting()}, {username || 'User'}!</h2>
          <p style={styles.message}>We're getting things ready for you...</p>
        </>
      ) : (
        <h2 style={styles.greeting}>Navigating to Dashboard...</h2>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f4f7fc',
    textAlign: 'center',
    padding: '0 20px',
  },
  greeting: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '20px',
    fontFamily: "'Roboto', sans-serif",
    fontWeight: '600',
  },
  message: {
    fontSize: '18px',
    color: '#777',
    marginBottom: '30px',
    fontFamily: "'Roboto', sans-serif",
  },
  iconContainer: {
    marginBottom: '20px',
  },
  dotContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: '12px',
    height: '12px',
    margin: '0 5px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    animation: 'bounce 1.4s infinite both',
  },
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)',
    },
    '40%': {
      transform: 'translateY(-10px)',
    },
    '60%': {
      transform: 'translateY(-5px)',
    },
  },
  footer: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    color: '#888',
  },
};
export default SplashScreen;