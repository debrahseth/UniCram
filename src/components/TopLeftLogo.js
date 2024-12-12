import React from 'react';
import logo from '../assets/main.jpg'; 

const TopLeftLogo = () => {
  return (
    <div style={styles.container}>
      <img src={logo} alt="Logo" style={styles.logo} />
    </div>
  );
};

const styles = {
  container: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    zIndex: 1000,
  },
  logo: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
};

export default TopLeftLogo;
