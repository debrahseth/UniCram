import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import logo from '../assets/logo2.jpg';

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserDetails({
              username: userDoc.data().username || currentUser.displayName || 'No Username',
              email: currentUser.email || 'No Email',
            });
          } else {
            console.log('User document not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate(-1)} style={styles.goBackButton}>
          <FaArrowLeft style={styles.icon} /> Go Back
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          <FaSignOutAlt style={styles.icon} /> Logout
        </button>
      </div>
      <div style={styles.profileCard}>
        <h3 style={styles.profileTitle}>Profile Details</h3>
        <div style={styles.profilePictureContainer}>
          <img
            src={logo}
            alt="Study Group Logo"
            style={styles.profilePicture}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}><i className="fa fa-user" style={styles.icon}></i>Username:</label>
          <input
            type="text"
            value={userDetails.username}
            readOnly
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}><i className="fa fa-envelope" style={styles.icon}></i>Email:</label>
          <input
            type="email"
            value={userDetails.email}
            readOnly
            style={styles.input}
          />
        </div>
        <div style={styles.footer}>
          <p>© 2025 StudyGroup. All rights reserved.</p>
        </div>
      </div>
      
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f4f7fc',
    padding: '20px',
    display: 'flex',
    height: '90vh',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF4C4C',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
    position: 'absolute',
    top: '20px',
    right: '20px',
  },
  goBackButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
    position: 'absolute',
    top: '20px',
    left: '20px',
  },
  icon: {
    fontSize: '18px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '98%',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileTitle: {
    textAlign: 'center',
    fontSize: '22px',
    color: '#333',
    marginBottom: '20px',
  },
  profilePictureContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  profilePicture: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  inputGroup: {
    marginBottom: '15px',
    width: '100%',
  },
  input: {
    width: '96%',
    padding: '12px',
    fontSize: '20px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f4f7fc',
    cursor: 'not-allowed',
    marginTop: '10px'
  },
  buttonContainer: {
    position: 'fixed',
    top: '0',
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
  label:{
    fontSize: '25px',
  },
  icon: {
    fontSize: '20px',
    marginRight: '8px',
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
    fontSize: '0.9rem',
    fontFamily: 'Poppins, sans-serif',
  },
};

export default Profile;
