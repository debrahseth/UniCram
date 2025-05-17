import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/opo.jpg';

const About = () => {
  const navigate = useNavigate();

  const containerStyle = {
    position: 'relative',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: 'Poppins, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#fff',
    zIndex: 1,
  };

  const background = {
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
    opacity: 1,
    zIndex: -1,
  };  

  const overlay = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: -1,
  };

  const headerStyle = {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textAlign: 'center',
  };

  const sectionHeaderStyle = {
    fontSize: '2.5rem',
    fontWeight: '600',
    margin: '40px 0 20px',
    textAlign: 'center',
  };

  const paragraphStyle = {
    fontSize: '1.5rem',
    lineHeight: '1.9',
    maxWidth: '1600px',
    margin: '0 auto 20px',
    fontWeight: '700',
    textAlign: 'justify',
  };

  const featureContainer = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '20px',
  };

  const featureCard = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#2c1b00',
    borderRadius: '10px',
    padding: '20px',
    width: '280px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  };

  const footer = {
    display: 'flex',
    flexDirection: "column",
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: '30px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 1)',
    padding: "20px",
    width: '90%'
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '30px',
  };

  const buttonStyle = {
    padding: '12px 40px',
    fontSize: '1.3rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '50px',
    backgroundColor: '#0EA5E9',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    transition: 'transform 0.3s ease, background-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <div style={background}></div>
      <div style={overlay}></div>

      <h2 style={headerStyle}>About Prime Academy</h2>
      <p style={paragraphStyle}>
          Prime Academy is your go-to platform for self-paced learning, academic excellence, and skill development. Whether you're a secondary school student or a university undergraduate, our platform is tailored to support your unique educational journey. With a focus on personalized learning, Prime Academy provides an extensive library of curated quizzes across various subjects and academic levels. These quizzes are designed to reinforce key concepts, improve retention, and boost confidence.
          <br /><br />
          In addition to practice questions, the app features intelligent progress tracking that helps you visualize your academic improvement over time. You can monitor your scores, identify areas of strength and weakness, and adjust your study strategy accordingly. Our innovative streak system motivates you to maintain consistency by rewarding daily engagement, making learning a habit rather than a chore.
          <br /><br />
          Whether you're preparing for class tests, semester exams, or competitive assessments, Prime Academy empowers you with the tools to succeed — anytime, anywhere. Join a growing community of learners and take charge of your education with confidence and clarity.
        </p>

      <h3 style={sectionHeaderStyle}>Our Features</h3>
      <div style={featureContainer}>
        {[
            { title: 'Custom Quizzes', desc: 'Tailor your learning by selecting courses, difficulty levels, and study programs to practice with relevant questions.' },
            { title: 'Progress Tracking', desc: 'Monitor your performance with detailed charts showing your scores over time and daily averages.' },
            { title: 'Answer Review', desc: 'Review quiz answers with explanations to understand mistakes and improve your knowledge.' },
            { title: 'Streak System', desc: 'Stay motivated by building daily streaks through consistent quiz practice.' },
            { title: 'Secure Authentication', desc: 'Log in or sign up safely with Firebase-powered authentication.' },
            { title: 'Daily Challenges', desc: 'Test your knowledge every day with personalized quizzes tailored to your course. Earn points, climb the leaderboard, and stay sharp!' },
            { title: 'Personalized Dashboard', desc: 'Access a tailored dashboard displaying your quiz history, streaks, and performance metrics, helping you stay organized and focused.' },
            { title: 'Daily Average Insights', desc: 'Analyze your daily quiz performance with average scores per subject, enabling you to track consistency and improvement.' },
            { title: 'Course Filtering', desc: 'Filter quizzes and performance data by specific courses to focus on subjects that matter most to your studies.' },
            { title: 'Reset Progress Option', desc: 'Start fresh by resetting your quiz scores and streaks, giving you flexibility to restart your learning journey.' },
        ].map((feature, index) => (
          <div
            key={index}
            style={featureCard}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <h4 style={{ fontSize: '1.3rem', marginBottom: '10px' }}>{feature.title}</h4>
            <p style={{ fontSize: '1rem' }}>{feature.desc}</p>
          </div>
        ))}
      </div>

      <h3 style={sectionHeaderStyle}>Why Choose Prime Academy?</h3>
      <p style={paragraphStyle}>
        Whether you're preparing for exams or sharpening your skills, Prime Academy helps you learn at your own pace. Gain confidence with practice, track your progress to identify strengths, and stay motivated with our engaging streak system. Join our community of learners today and take control of your academic journey!
      </p>

      <div style={footer}>
        <strong>Need help or have questions?</strong> We'd love to hear from you! Reach out to us directly via:
        <br></br>
        <a href="https://wa.me/233544806525" style={{ color: 'white', textDecoration: 'none', margin: '10px'}}><FaWhatsapp size={20} /> WhatsApp </a>
        <a href="mailto:support@primeacademy.com" style={{ color: 'white', textDecoration: 'none', margin: '10px' }}><FaEnvelope size={20} /> Email </a>
      </div>   

      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <FaHome style={{ marginRight: '10px', fontSize: '1.5rem' }} />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default About;
