import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import logo from '../assets/logo.jpg';

const Home = () => {
  const navigate = useNavigate();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '90vh',
    backgroundColor: '#f3f4f6',
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
  };

  const headerStyle = {
    fontSize: '3.5rem',
    color: '#000000',
    fontWeight: '700',
    marginBottom: '30px',
  };

  const paragraphStyle = {
    fontSize: '1.25rem',
    color: '#333',
    marginBottom: '40px',
    lineHeight: '1.6',
  };

  const buttonStyle = {
    padding: '15px 35px',
    margin: '10px',
    fontSize: '1.2rem',
    fontWeight: '500',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: '0.3s',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  const buttonSignUpStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: '#fff',
  };

  const buttonLoginStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    color: '#fff',
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049',
  };

  const buttonLoginHoverStyle = {
    backgroundColor: '#1e88e5',
  };

  const handleMouseEnter = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
  };

  const handleMouseLeave = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Welcome to the Learning Page</h2>
      <img
        src={logo}
        alt="Study Group Logo"
        style={{ width: '400px', marginBottom: '20px', borderRadius: '50%'}}
      />
      <p style={paragraphStyle}>
        Start by logging in or signing up to take the quiz.
      </p>
      <div style={buttonStyle}>
        <button
          style={buttonSignUpStyle}
          onClick={() => navigate('/signup')}
          onMouseEnter={(e) => handleMouseEnter(e, buttonHoverStyle)}
          onMouseLeave={(e) => handleMouseLeave(e, buttonSignUpStyle)}
        >
          <FaUserPlus style={{ marginRight: '10px', fontSize: '1.4rem' }} />
          Sign Up
        </button>
        <button
          style={buttonLoginStyle}
          onClick={() => navigate('/login')}
          onMouseEnter={(e) => handleMouseEnter(e, buttonLoginHoverStyle)}
          onMouseLeave={(e) => handleMouseLeave(e, buttonLoginStyle)}
        >
          <FaSignInAlt style={{ marginRight: '33px', fontSize: '1.4rem' }} />
          Login
        </button>
      </div>
    </div>
  );
};

export default Home;
