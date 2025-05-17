import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { spiral } from 'ldrs';
import logo from '../assets/welcome1.jpg';

const SplashScreen = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [displayedGreeting, setDisplayedGreeting] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'GOOD MORNING';
    } else if (hour < 18) {
      return 'GOOD AFTERNOON';
    } else {
      return 'GOOD EVENING';
    }
  };

  spiral.register()

  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username);
          }
      }
    };
    fetchUserInfo();
    const timer = setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
      alert("For better UI experience, set your screen zoom to 75% or 80%. Thank you")
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (username && !hasStartedTyping) {
      const fullText = `${getGreeting()}, ${username || 'User'}!`;
      let index = -1;

      setDisplayedGreeting('');

      const typingInterval = setInterval(() => {
        setDisplayedGreeting((prev) => prev + fullText.charAt(index));
        index++;
        if (index >= fullText.length) clearInterval(typingInterval);
      }, 150);
      setHasStartedTyping(true);
    }
  }, [username, hasStartedTyping]);

  return (
    <div style={styles.container}>
      {loading ? (
        <>
          <div style={styles.content}>
          <img src={logo} alt="Welcome" style={styles.welcomeImage} />
            <div style={styles.textContainer}> 
              <h2 style={styles.greeting}>
                {displayedGreeting || 'WELCOME'}
              </h2>
              <p style={styles.message}>Prime Academy is getting things ready for you...</p>
              <l-spiral size="50" speed="0.9" color="black"></l-spiral>
            </div>
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
    minHeight: "48px",
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
  },
};

export default SplashScreen;