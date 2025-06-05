import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "font-awesome/css/font-awesome.min.css";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import logo from "../assets/op.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
    setTimeout(() => {
      document.getElementById("loginForm").classList.add("fadeInUp");
    }, 300);
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setShowVerificationModal(true);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userDocRef, { status: "online" });

        if (userData.role === "admin") {
          navigate("/admin-splash");
        } else {
          if (rememberMe) {
            localStorage.setItem("email", email);
            localStorage.setItem("password", password);
          } else {
            localStorage.removeItem("email");
            localStorage.removeItem("password");
          }
          navigate("/splash");
        }
      } else {
        setError("User does not exist in the system.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    setLoadingReset(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset email sent. Please check your inbox.");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoadingReset(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await auth.currentUser.sendEmailVerification();
      setError("Verification email sent. Please check your inbox.");
      setShowVerificationModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <h1 style={styles.appName}>Prime Academy</h1>
        <p style={styles.welcomeNote}>
          Welcome back! Please login to continue.
        </p>
      </div>

      <div style={styles.logoContainer}>
        <img src={logo} alt="App Logo" style={styles.logo} />
      </div>

      <div id="loginForm" style={styles.formContainer}>
        <h2 style={styles.title}>Login</h2>
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
        <div style={styles.rememberMeContainer}>
          <label style={styles.rememberMeLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              style={styles.checkbox}
            />
            Remember Me
          </label>
          <button
            onClick={handlePasswordReset}
            style={styles.forgotPasswordButton}
            disabled={loadingReset}
          >
            {loadingReset ? (
              <i className="fa fa-spinner fa-spin" style={styles.spinner}></i>
            ) : (
              "Forgot Password?"
            )}
          </button>
        </div>
        {error && <p style={styles.error}>{error}</p>}
        {loading ? (
          <div style={styles.loading}>
            <i className="fa fa-spinner fa-spin" style={styles.spinner}></i>
            Logging in...
          </div>
        ) : (
          <button
            onClick={handleLogin}
            style={styles.button}
            disabled={loading}
          >
            Login
          </button>
        )}
        <button onClick={() => navigate("/")} style={styles.button}>
          Go Back
        </button>
      </div>

      {showVerificationModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Email Verification Required</h3>
            <p style={styles.modalText}>
              Please verify your email address to log in. Check your inbox for a
              verification email or click below to resend it.
            </p>
            <div style={styles.modalButtonContainer}>
              <button
                onClick={handleResendVerification}
                style={styles.modalButton}
              >
                Resend Verification Email
              </button>
              <button
                onClick={() => setShowVerificationModal(false)}
                style={{ ...styles.modalButton, backgroundColor: "#ccc" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.footerStyle}>
        <p style={{ fontSize: "30px" }}>
          © 2025 Prime Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
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
  appName: {
    fontSize: "40px",
    fontWeight: "700",
    color: "#333",
    textTransform: "uppercase",
  },
  welcomeNote: {
    fontSize: "25px",
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
    maxWidth: "90%",
    height: "auto",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.9)",
  },
  formContainer: {
    borderRadius: "8px",
    padding: "27px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.7)",
    width: "100%",
    maxWidth: "600px",
    opacity: 0,
    animation: "fadeInUp 1s ease forwards 1s",
    transition: "all 0.3s ease-in-out",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "600",
    color: "#333",
    textTransform: "uppercase",
  },
  inputGroup: {
    position: "relative",
    marginBottom: "25px",
  },
  icon: {
    position: "absolute",
    top: "50%",
    left: "15px",
    transform: "translateY(-50%)",
    color: "#999",
  },
  input: {
    width: "85%",
    padding: "14px 40px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    transition: "border-color 0.3s",
  },
  button: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "25px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "15px",
  },
  error: {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "15px",
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
    fontSize: "25px",
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
  rememberMeContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "10px",
  },
  rememberMeLabel: {
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
  },
  checkbox: {
    marginRight: "5px",
  },
  forgotPasswordButton: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "14px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.7)",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
    color: "#333",
  },
  modalText: {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#666",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "space-around",
  },
  modalButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background-color 0.3s",
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

export default Login;
