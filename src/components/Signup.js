import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
      });
      navigate('/splash');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Sign Up</h2>
        <div style={styles.inputGroup}>
          <i className="fa fa-user" style={styles.icon}></i>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <i className="fa fa-envelope" style={styles.icon}></i>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <i className="fa fa-lock" style={styles.icon}></i>
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            style={styles.toggleButton}
          >
            <i className={`fa ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? (
          <div style={styles.loading}>
            <i className="fa fa-spinner fa-spin" style={styles.spinner}></i>
            Signing up...
          </div>
        ) : (
          <button onClick={handleSignup} style={styles.button} disabled={loading}>
            Sign Up
          </button>
        )}

        <button onClick={() => navigate('/')} style={styles.button}>
          Go Back
        </button>
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
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f7fc',
    padding: '0 20px',
    fontFamily: 'Poppins, sans-serif',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '450px',
    transition: 'all 0.3s ease-in-out',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    position: 'relative',
    marginBottom: '25px',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    left: '15px',
    transform: 'translateY(-50%)',
    color: '#999',
  },
  input: {
    width: '80%',
    padding: '14px 40px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  inputFocus: {
    borderColor: '#4CAF50',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '20px',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '15px',
  },
  footerStyle: {
    position: 'fixed',
    bottom: '0',
    left: '0',
    width: '100%',
    padding: '12px',
    backgroundColor: '#333',
    color: '#fff',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontFamily: 'Poppins, sans-serif',
  },
  loading: {
    textAlign: 'center',
    fontSize: '16px',
    color: '#4CAF50',
    marginTop: '20px',
  },
  spinner: {
    fontSize: '24px',
    marginRight: '10px',
  },
  toggleButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '20px',
  },
};

export default Signup;
