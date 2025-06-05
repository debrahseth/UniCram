import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import logo from "../assets/prince.jpg";

const Home = () => {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setShowModal(true);
  }, []);

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  };

  const modalButtonStyle = {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "1rem",
    fontWeight: "600",
    backgroundColor: "#0EA5E9",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
    padding: "20px",
  };

  const background = {
    content: '""',
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    opacity: 1,
    zIndex: -2,
  };

  const headerStyle = {
    fontSize: "3.8rem",
    color: "black",
    fontWeight: "700",
    marginBottom: "30px",
    textTransform: "uppercase",
    letterSpacing: "2px",
    animation: "fadeIn 1s ease-out",
  };

  const paragraphStyle = {
    fontSize: "2.5rem",
    color: "black",
    marginBottom: "20px",
    lineHeight: "1.7",
    animation: "fadeIn 1.5s ease-out",
  };

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    opacity: 0,
    animation: "fadeIn 2s ease-out forwards",
  };

  const buttonContainer = {
    display: "flex",
    justifyContent: "center",
    position: "absolute",
    bottom: "20px",
    opacity: 0,
    animation: "fadeIn 2s ease-out forwards",
  };

  const buttonStyle = {
    padding: "12px 40px",
    margin: "10px",
    fontSize: "1.3rem",
    fontWeight: "600",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    transition: "0.3s ease",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  };

  const buttonAbout = {
    ...buttonStyle,
    backgroundColor: "#0EA5E9",
    color: "#fff",
    transform: "scale(1)",
    transition: "transform 0.3s ease",
    fontSize: "2.0rem",
  };

  const buttonSignUpStyle = {
    ...buttonStyle,
    backgroundColor: "#4CAF50",
    color: "#fff",
    transform: "scale(1)",
    transition: "transform 0.3s ease",
    fontSize: "2.0rem",
  };

  const buttonLoginStyle = {
    ...buttonStyle,
    backgroundColor: "#2196F3",
    color: "#fff",
    transform: "scale(1)",
    transition: "transform 0.3s ease",
    fontSize: "2.0rem",
  };

  const buttonHoverStyle = {
    backgroundColor: "#45a049",
    transform: "scale(1.05)",
  };

  const buttonLoginHoverStyle = {
    backgroundColor: "#1e88e5",
    transform: "scale(1.05)",
  };

  const buttonAboutHoverStyle = {
    backgroundColor: "#1e88e5",
    transform: "scale(1.05)",
  };

  const handleMouseEnter = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
    e.target.style.transform = style.transform;
  };

  const handleMouseLeave = (e, style) => {
    e.target.style.backgroundColor = style.backgroundColor;
    e.target.style.transform = "scale(1)";
  };

  return (
    <div style={containerStyle}>
      <div style={background}></div>
      <h2 style={headerStyle}>Prime Academy</h2>
      <p style={paragraphStyle}>
        Start by logging in or signing up to join the community.
      </p>
      <div style={buttonContainerStyle}>
        <div style={buttonStyle}>
          <button
            style={buttonSignUpStyle}
            onClick={() => navigate("/signup")}
            onMouseEnter={(e) => handleMouseEnter(e, buttonHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, buttonSignUpStyle)}
          >
            <FaUserPlus style={{ marginRight: "10px", fontSize: "1.5rem" }} />
            Sign Up
          </button>
          <button
            style={buttonLoginStyle}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => handleMouseEnter(e, buttonLoginHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, buttonLoginStyle)}
          >
            <FaSignInAlt style={{ marginRight: "10px", fontSize: "1.5rem" }} />
            Login
          </button>
        </div>
      </div>
      <div style={buttonContainer}>
        <div style={buttonStyle}>
          <button
            onClick={() => navigate("/about")}
            style={buttonAbout}
            onMouseEnter={(e) => handleMouseEnter(e, buttonAboutHoverStyle)}
            onMouseLeave={(e) => handleMouseLeave(e, buttonAbout)}
          >
            About Prime Academy
          </button>
        </div>
      </div>
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
              Welcome to Prime Academy!
            </h2>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.5" }}>
              For the best experience, please use a desktop or laptop. We're
              still working on improving mobile accessibility. We apologize for
              the inconvenience.
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={modalButtonStyle}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
