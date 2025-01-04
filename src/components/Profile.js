import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import logo from '../assets/logo2.jpg';

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: '', email: '', programOfStudy: '' });
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [programOfStudy, setProgramOfStudy] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  let inactivityTimeout;

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
              programOfStudy: userDoc.data().programOfStudy || 'No Program of Study',
            });
            setProgramOfStudy(userDoc.data().programOfStudy || '');
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

    if (currentUser) {
      fetchUserDetails();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          status: 'offline',
        });
      }
      await auth.signOut();
      setLogoutLoading(false);
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error.message);
      setLogoutLoading(false);
    }
  };

  const useInactivityLogout = (timeoutDuration = 10000) => {
    useEffect(() => {
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(handleLogout, timeoutDuration);
      };
      window.addEventListener('mousemove', resetInactivityTimer);
      window.addEventListener('keydown', resetInactivityTimer);
      resetInactivityTimer();
      return () => {
        clearTimeout(inactivityTimeout);
        window.removeEventListener('mousemove', resetInactivityTimer);
        window.removeEventListener('keydown', resetInactivityTimer);
      };
    }, [timeoutDuration]);
  };
  useInactivityLogout();
  
  const handleUpdateProgramOfStudy = async () => {
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          programOfStudy: programOfStudy,
        });
        setUserDetails((prevDetails) => ({
          ...prevDetails,
          programOfStudy: programOfStudy,
        }));
        alert('Program of Study updated');
      }
    } catch (error) {
      console.error('Error updating program of study:', error);
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  if (logoutLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Logging out...</p>
      </div>
    );
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
        <div style={styles.inputGroup}>
          <label style={styles.label}><i className="fa fa-graduation-cap" style={styles.icon}></i>Program of Study:</label>
          <input
            type="text"
            value={programOfStudy}
            onChange={(e) => setProgramOfStudy(e.target.value)}
            placeholder="Enter your program of study"
            style={styles.programInput}
          />
        </div>
        <button onClick={handleUpdateProgramOfStudy} style={styles.updateButton}>
          Update Program of Study
        </button>
      </div>
        <button onClick={() => navigate('/record')} style={styles.recordButton}>
          <i className="fa fa-trophy"></i> My Achievements <i className="fa fa-trophy"></i>
        </button>
        <div style={styles.footer}>
          <p>© 2025 StudyGroup. All rights reserved.</p>
        </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f4f7fc',
    padding: '10px',
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
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
    position: 'absolute',
    top: '10px',
    right: '20px',
  },
  recordButton: {
    backgroundColor: '#FFD700',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '10px 15px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
    position: 'absolute',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
  },  
  goBackButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    padding: '12px 20px',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.3s',
    position: 'absolute',
    top: '10px',
    left: '20px',
  },
  updateButton: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    fontWeight: '600',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '10px',
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
    marginBottom: '10px',
  },
  profilePicture: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  inputGroup: {
    marginBottom: '10px',
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
  programInput: {
    width: '96%',
    padding: '12px',
    fontSize: '20px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f4f7fc',
    cursor: 'text',
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
    fontSize: '20px',
  },
  icon: {
    fontSize: '15px',
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
