import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import logo from '../assets/main.jpg';

const Home = () => {
  const navigate = useNavigate();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '94.8vh',
    background: 'linear-gradient(to right,rgb(91, 180, 212),rgb(4, 66, 54))',
    textAlign: 'center',
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
  };

  const headerStyle = {
    fontSize: '3.8rem',
    color: 'black',
    fontWeight: '700',
    marginBottom: '30px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    animation: 'fadeIn 1s ease-out',
  };

  const paragraphStyle = {
    fontSize: '2.5rem',
    color: 'black',
    marginBottom: '20px',
    lineHeight: '1.7',
    animation: 'fadeIn 1.5s ease-out',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    opacity: 0,
    animation: 'fadeIn 2s ease-out forwards',
  };

  const buttonStyle = {
    padding: '12px 40px',
    margin: '10px',
    fontSize: '1.3rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: '0.3s ease',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  };

  const buttonSignUpStyle = {
    ...buttonStyle,
    backgroundColor: '#4CAF50',
    color: '#fff',
    transform: 'scale(1)',
    transition: 'transform 0.3s ease',
    fontSize: '2.0rem'
  };

  const buttonLoginStyle = {
    ...buttonStyle,
    backgroundColor: '#2196F3',
    color: '#fff',
    transform: 'scale(1)',
    transition: 'transform 0.3s ease',
    fontSize: '2.0rem'
  };

  const buttonHoverStyle = {
    backgroundColor: '#45a049',
    transform: 'scale(1.05)',
  };

  const buttonLoginHoverStyle = {
    backgroundColor: '#1e88e5',
    transform: 'scale(1.05)',
  };

  const handleMouseEnter = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
    e.target.style.transform = style.transform;
  };

  const handleMouseLeave = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
    e.target.style.transform = 'scale(1)';
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>UniBuddy Team</h2>
      <img
        src={logo}
        alt="Study Group Logo"
        style={{ width: '300px', height: '300px', marginBottom: '20px', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',transform: 'scale(1)',transition: 'transform 0.3s ease',}}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}/>
      <p style={paragraphStyle}>
        Start by logging in or signing up to join the community.
      </p>
      <div style={buttonContainerStyle}>
        <div style={buttonStyle}>
          <button
            style={buttonSignUpStyle}
            onClick={() => navigate('/signup')}
            onMouseEnter={(e) => handleMouseEnter(e, buttonHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, buttonSignUpStyle)}
          >
            <FaUserPlus style={{ marginRight: '10px', fontSize: '1.5rem' }} />
            Sign Up
          </button>
          <button
            style={buttonLoginStyle}
            onClick={() => navigate('/login')}
            onMouseEnter={(e) => handleMouseEnter(e, buttonLoginHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, buttonLoginStyle)}
          >
            <FaSignInAlt style={{ marginRight: '10px', fontSize: '1.5rem' }} />
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
