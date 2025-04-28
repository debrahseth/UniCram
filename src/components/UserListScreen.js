import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import '../styles.css';
import { FaChevronLeft } from 'react-icons/fa';
import logo from '../assets/op.jpg';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setIsLoading(false);
      },
      (err) => {
        setError('Failed to load users');
        setIsLoading(false);
      }
    );
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
      <h1 style={styles.header}>THE PRIME ACADEMY COMMUNITY</h1>

      <div style={styles.scrollableContainer}>
        {users.length > 0 ? (
          <table style={styles.table}>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                  <td style={styles.tableCell1}>{user.username}</td>
                  <td style={styles.tableCell1}>BSc. {user.programOfStudy || 'No Program'}</td>
                  <td style={styles.tableCell1}>{user.levelOfStudy || 'No Level'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
      <div style={styles.buttonContainment}>
        <button onClick={() => navigate(-1)} style={styles.goBackButton}>
          <FaChevronLeft style={styles.icon} /> Go Back
        </button>
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
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    opacity: 0.9,
    zIndex: -1,
  },
  header: {
    fontSize: '40px',
    fontWeight: '900',
    marginBottom: '20px',
    width: '90%',
    backgroundColor: '#FFD700',
    padding: '20px',
    textAlign: 'center',
    borderRadius: '10px',
    position: 'relative',
    zIndex: 1,
  },
  scrollableContainer: {
    flex: 1,
    marginTop: '5px',
    marginBottom: '100px',
    overflowY: 'auto',
    opacity: '0.9',
    width: '90%',
    height: "auto",
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableCell1: {
    padding: '20px',
    borderBottom: '2px solid #ddd',
    fontSize: '25px',
    fontWeight: '500',
    textAlign: 'center',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#ffffff',
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
    width: '60%',
  },
  buttonContainment: {
    width: '100%',
    position: 'fixed',
    bottom: '0',
    left: '0',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default UserListScreen;