import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import logo from "../assets/original.png";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programOfStudy, setProgram] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [semesterOfStudy, setSemesterOfStudy] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  const programs = [
    "Agricultural Engineering",
    "Aerospace Engineering",
    "Automobile Engineering",
    "Biomedical Engineering",
    "Chemical Engineering",
    "Civil Engineering",
    "Computer Engineering",
    "Electrical and Electronics Engineering",
    "Geological Engineering",
    "Geomatic Engineering",
    "Industrial Engineering",
    "Marine Engineering",
    "Materials Engineering",
    "Mechanical Engineering",
    "Metallurgical Engineering",
    "Petrochemical Engineering",
    "Petroleum Engineering",
    "Telecommunications Engineering",
  ];

  useEffect(() => {
    setTimeout(() => {
      document.getElementById("signupForm").classList.add("fadeInUp");
    }, 300);
  }, []);

  useEffect(() => {
    let interval;
    if (!canResend && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

  const validateFields = () => {
    if (!username.trim()) {
      setError("Username is required.");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Password is required.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const validateAdditionalFields = () => {
    if (!programOfStudy) {
      setError("Program of Study is required.");
      return false;
    }
    if (!levelOfStudy) {
      setError("Level of Study is required.");
      return false;
    }
    if (!semesterOfStudy) {
      setError("Semester of Study is required.");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setError("");
    if (!validateFields()) {
      return;
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setVerificationSent(false);
    if (!auth.currentUser?.emailVerified) {
      auth.currentUser?.delete().catch((err) => {
        console.error("Failed to delete unverified user:", err);
      });
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!validateAdditionalFields()) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);
      setVerificationSent(true);

      setTempUserData({
        uid: user.uid,
        username,
        email,
        programOfStudy,
        levelOfStudy,
        semesterOfStudy,
        status: "online",
        role: "user",
      });

      const verificationCheck = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(verificationCheck);

          await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            programOfStudy: programOfStudy,
            levelOfStudy: levelOfStudy,
            semesterOfStudy: semesterOfStudy,
            status: "online",
            role: "user",
          });
          setModalOpen(false);
          setLoading(false);
          navigate("/splash");
        }
      }, 2000);
    } catch (error) {
      console.error("Error during sign-up:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setError("Verification email resent. Please check your inbox.");
      setResendTimer(60);
      setCanResend(false);
    } catch (error) {
      setError("Failed to resend verification email. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.appName}>Prime Academy</h1>
        <p style={styles.welcomeNote}>
          Welcome! Please create an account to continue.
        </p>
      </div>

      <div style={styles.logoContainer}>
        <img src={logo} alt="App Logo" style={styles.logo} />
      </div>

      <div id="signupForm" style={styles.formContainer}>
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
            <i
              className={`fa ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`}
            ></i>
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSignup} style={styles.button} disabled={loading}>
          Sign Up
        </button>

        <button onClick={() => navigate("/")} style={styles.button}>
          Go Back
        </button>
      </div>

      <div style={styles.footerStyle}>
        <p style={{ fontSize: "30px" }}>
          © 2025 Prime Academy. All rights reserved.
        </p>
      </div>

      {modalOpen && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            {verificationSent ? (
              <>
                <h2>Email Verification</h2>
                <p>
                  A verification email has been sent to <strong>{email}</strong>
                  . Please check your inbox, open the email, and click the
                  verification link to complete your signup. You must verify
                  your email before you can successfully sign up and access
                  Prime Academy.
                </p>
                <p>
                  <em>
                    Didn't receive the email? Check your spam or junk folder.
                  </em>
                </p>
                <button
                  onClick={handleResendVerification}
                  style={{
                    ...styles.button,
                    backgroundColor: canResend ? "#1976d2" : "#ccc",
                    cursor: canResend ? "pointer" : "not-allowed",
                  }}
                  disabled={!canResend}
                >
                  {canResend
                    ? "Resend Verification Email"
                    : `Resend available in ${resendTimer}s`}
                </button>
                <button onClick={handleCloseModal} style={styles.button}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h2>Enter Your Details</h2>
                <label style={styles.label}>Program of Study:</label>
                <div
                  style={styles.dropdownContainer}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <div style={styles.input1}>
                    {programOfStudy || "Select Program"}
                  </div>
                  {isOpen && (
                    <div style={styles.dropdownMenu}>
                      {programs.map((program, index) => (
                        <div
                          key={index}
                          style={{
                            ...styles.dropdownItem,
                            ...(hoveredIndex === index
                              ? styles.dropdownItemHover
                              : {}),
                          }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => {
                            setProgram(program);
                            setIsOpen(false);
                          }}
                        >
                          {program}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label style={styles.label}>Level of Study:</label>
                <select
                  value={levelOfStudy}
                  onChange={(e) => setLevelOfStudy(e.target.value)}
                  style={styles.input1}
                >
                  <option value="">Select Level</option>
                  <option value="Level 100">Level 100</option>
                  <option value="Level 200">Level 200</option>
                  <option value="Level 300">Level 300</option>
                </select>
                <label style={styles.label}>Semester of Study:</label>
                <select
                  value={semesterOfStudy}
                  onChange={(e) => setSemesterOfStudy(e.target.value)}
                  style={styles.input1}
                >
                  <option value="">Select Semester</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                </select>
                {error && <p style={styles.error}>{error}</p>}
                {loading ? (
                  <div style={styles.loading}>
                    <i
                      className="fa fa-spinner fa-spin"
                      style={styles.spinner}
                    ></i>
                    Signing up...
                  </div>
                ) : (
                  <button
                    onClick={handleSubmit}
                    style={styles.button}
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                )}
                <button onClick={handleCloseModal} style={styles.button}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f7fc",
    padding: "0 20px",
    fontFamily: "Poppins, sans-serif",
    flexDirection: "row",
    overflow: "hidden",
  },
  header: {
    position: "absolute",
    top: "20px",
    transform: "translateX(-50%)",
    textAlign: "center",
    zIndex: 10,
    opacity: 0,
    animation: "fadeInUp 1s ease forwards 0.5s",
    boxShadow: "0 8px 10px rgba(0,0,0,0.8)",
    width: "90%",
    borderRadius: "10px",
  },
  modal: {
    position: "fixed",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "600px",
    textAlign: "center",
    opacity: "0.8",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    gap: "10px",
  },
  label: {
    fontSize: "20px",
    textAlign: "left",
    fontWeight: 700,
  },
  appName: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
  },
  welcomeNote: {
    fontSize: "20px",
    color: "#666",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxWidth: "500px",
    padding: "10px",
    flex: "1",
    opacity: 0,
    animation: "fadeInUp 1s ease forwards 0.8s",
  },
  logo: {
    maxWidth: "97%",
    height: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.8)",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "46px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.8)",
    width: "100%",
    maxWidth: "500px",
    opacity: 0,
    animation: "fadeInUp 1s ease forwards 1s",
    transition: "all 0.3s ease-in-out",
  },
  title: {
    textAlign: "center",
    marginBottom: "10px",
    fontSize: "28px",
    fontWeight: "600",
    color: "#333",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "20px",
  },
  icon: {
    position: "absolute",
    top: "50%",
    left: "15px",
    transform: "translateY(-50%)",
    color: "#999",
  },
  input: {
    width: "82%",
    padding: "14px 40px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s",
  },
  input1: {
    width: "100%",
    padding: "14px 40px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s",
  },
  inputFocus: {
    borderColor: "#4CAF50",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "20px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "10px",
  },
  buttonHover: {
    backgroundColor: "#45a049",
  },
  error: {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "15px",
  },
  footerStyle: {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    padding: "12px",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    fontSize: "0.9rem",
    fontFamily: "Poppins, sans-serif",
  },
  loading: {
    textAlign: "center",
    fontSize: "16px",
    color: "#4CAF50",
    marginTop: "20px",
  },
  spinner: {
    fontSize: "24px",
    marginRight: "10px",
  },
  toggleButton: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    fontSize: "20px",
  },
  dropdownContainer: {
    width: "86.5%",
    fontSize: "16px",
    textAlign: "left",
    borderRadius: "5px",
    backgroundColor: "white",
    cursor: "pointer",
    position: "relative",
  },
  dropdownMenu: {
    position: "absolute",
    width: "115%",
    maxHeight: "150px",
    overflowY: "auto",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1000,
  },
  dropdownItem: {
    padding: "10px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
    transition: "background-color 0.3s ease",
  },
  dropdownItemHover: {
    backgroundColor: "#f0f0f0",
  },
};

const keyframes = `
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleUp {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

document.head.insertAdjacentHTML("beforeend", `<style>${keyframes}</style>`);

export default Signup;
