import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { spiral } from 'ldrs';
import welcomeImage from '../assets/welcomeImage.jpg';
import logo from '../assets/welcome.jpg';

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

  spiral.register()

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
          <div style={styles.content}>
            <div style={styles.textContainer}> 
              <div style={styles.profilePictureContainer}>
                <img
                  src={logo}
                  alt="Study Group Logo"
                  style={styles.profilePicture}
                />
              </div>
              <h2 style={styles.greeting}>{getGreeting()}, {username || 'User'}!</h2>
              <p style={styles.message}>Prime Academy is getting things ready for you...</p>
              <l-spiral size="50" speed="0.9" color="black"></l-spiral>
            </div>
            <img src={welcomeImage} alt="Welcome" style={styles.welcomeImage} />
          </div>
        </>
      ) : (
        <h2 style={styles.greeting}>Navigating to Dashboard...</h2>
      )}
    </div>
  );  
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    backgroundColor: "#f4f4f4",
    animation: "fadeIn 2s ease-in-out",
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    maxWidth: "1200px",
    padding: "30px",
    backgroundColor: "#ffffff",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    opacity: 0,
    animation: "fadeIn 2s forwards",
    transform: "translateY(10px)",
  },
  profilePictureContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center", 
    width: "100%", 
    marginBottom: '20px',
  },
  profilePicture: {
    width: '250px',
    height: '250px',
    borderRadius: '10%',
    objectFit: 'cover',
    display: "block",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    textAlign: "center",
  },
  greeting: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  message: {
    fontSize: "22px",
    color: "#555",
    marginBottom: "25px",
  },
  welcomeImage: {
    flex: 1,
    width: "50%",
    height: "auto",
    objectFit: "cover",
    maxHeight: "1200px",
    borderRadius: "10px",
    animation: "fadeIn 2s ease-in-out",
  },
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  }
};

export default SplashScreen;