import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import '../styles.css';
import {FaChevronLeft} from 'react-icons/fa';
import logo from '../assets/logo1.jpg';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      try {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load users');
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={styles.container}>
    <div style={styles.background}></div>
      <h1 style={styles.header}>The Brain Snacks Community</h1>
      <div style={styles.scrollableContainer}>
        <div style={styles.userList}>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} style={styles.userCard}>
                <div style={styles.userInfo}>
                  <h2 style={styles.userName}>{user.username}</h2>
                  <h2 style={styles.userProgram}>Program: {user.programOfStudy || 'No Program'}</h2>
                </div>
              </div>
            ))
          ) : (
            <p>No users found.</p>
          )}
        </div>
      </div>
        <button onClick={() => navigate(-1)} style={styles.goBackButton}>
          <FaChevronLeft style={styles.icon} /> Go Back
        </button>
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
header: {
  fontSize: '36px',
  fontWeight: '900',
  marginBottom: '20px',
  width: '90%',
  backgroundColor: '#FFD700',
  padding: '20px',
  textAlign: 'center',
  borderRadius: '10px 10px 10px 10px',
  position: 'relative',
  zIndex: 1,
  opacity: 0.8,
},
scrollableContainer: {
  flex: 1,     
  marginTop: '5px',    
  marginBottom: '10px',    
  overflowY: 'auto',
  opacity: '0.9',
  width: '100%'
},
userList: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
},
userCard: {
  width: '80%',
  padding: '10px',
  margin: '10px 0',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  opacity: '0.7'
},
userInfo: {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
},
userName: {
  fontSize: '24px',
  fontWeight: 'bold',
  marginLeft: '15px',
},
userProgram: {
  fontSize: '20px',
  color: 'black',
  marginLeft: '150px',
  fontWeight: '600'
},
goBackButton: {
  backgroundColor: '#2196F3',
  color: 'white',
  padding: '10px 10px',
  fontSize: '25px',
  fontWeight: '600',
  cursor: 'pointer',
  borderRadius: '10px',
  marginTop: '20px',
  marginBottom: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'background-color 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '60%'
},
};

export default UserListScreen;
