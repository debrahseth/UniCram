import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';  // Import Font Awesome icons
import { auth, db } from '../firebase'; // Import Firebase Auth and Firestore
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods

const Profile = () => {
  const [userDetails, setUserDetails] = useState({ username: '', email: '' }); // Store user details
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get the currently logged in user
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Fetch the user's document from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // Set the retrieved data into state
            setUserDetails({
              username: userDoc.data().username || currentUser.displayName || 'No Username',
              email: currentUser.email || 'No Email',
            });
          } else {
            // In case the user document does not exist in Firestore
            console.log('User document not found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    fetchUserDetails();
  }, []);

  // Handle logout
  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching user data
  }

  return (
    <div style={styles.container}>
      {/* Logout Button with Icon */}
      <button onClick={handleLogout} style={styles.logoutButton}>
        <FaSignOutAlt style={styles.icon} /> Logout
      </button>

      {/* Profile Card */}
      <div style={styles.profileCard}>
        <h3 style={styles.profileTitle}>Profile Details</h3>

        {/* Username */}
        <div style={styles.inputGroup}>
          <label>Username:</label>
          <input
            type="text"
            value={userDetails.username}
            readOnly
            style={styles.input}
          />
        </div>

        {/* Email */}
        <div style={styles.inputGroup}>
          <label>Email:</label>
          <input
            type="email"
            value={userDetails.email}
            readOnly
            style={styles.input}
          />
        </div>
      </div>

      {/* Go Back Button */}
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate(-1)} style={styles.goBackButton}>
          <FaArrowLeft style={styles.icon} /> Go Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#f4f7fc',
    padding: '20px',
    minHeight: '100vh',
    display: 'flex',
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
    position: 'absolute',
    top: '20px',
    right: '20px',
    transition: 'background-color 0.3s',
  },
  icon: {
    fontSize: '18px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    width: '100%',
    maxWidth: '600px',
    marginTop: '40px',
    textAlign: 'left',
  },
  profileTitle: {
    textAlign: 'center',
    fontSize: '22px',
    color: '#333',
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '96%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#f4f7fc',
    cursor: 'not-allowed',
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
  },
};

export default Profile;
