import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaArrowLeft, FaTrash } from "react-icons/fa";
import { db, auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getFirestore,
  getDocs,
  collection,
} from "firebase/firestore";
import { getAuth, deleteUser } from "firebase/auth";
import logo1 from "../assets/op.jpg";
import logo from "../assets/download.png";
import { dotWave, metronome, spiral, lineSpinner } from "ldrs";

const Profile = () => {
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    programOfStudy: "",
    levelOfStudy: "",
    semesterOfStudy: "",
  });
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const [programLoading, setProgramLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [levelLoading, setLevelLoading] = useState(false);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [programOfStudy, setProgramOfStudy] = useState("");
  const [levelOfStudy, setLevelOfStudy] = useState("");
  const [semesterOfStudy, setSemesterOfStudy] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userDocUnsubscribe, setUserDocUnsubscribe] = useState(null);
  const navigate = useNavigate();
  const authInstance = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
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

  let inactivityTimeout;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [authInstance, navigate]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserDetails({
            username:
              userDoc.data().username ||
              currentUser.displayName ||
              "No Username",
            email: currentUser.email || "No Email",
            programOfStudy:
              userDoc.data().programOfStudy || "No Program of Study",
            semesterOfStudy:
              userDoc.data().semesterOfStudy || "No Semester of Study",
            levelOfStudy: userDoc.data().levelOfStudy || "No Level of Study",
            userNumber: userDoc.data().userNumber || "No Contact Number",
          });
          setProgramOfStudy(userDoc.data().programOfStudy || "");
          setSemesterOfStudy(userDoc.data().semesterOfStudy || "");
          setLevelOfStudy(userDoc.data().levelOfStudy || "");
          setUserNumber(userDoc.data().userNumber || "");
        }
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserDetails();
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) return;
      const userData = docSnapshot.data();
      if (userData.status === "offline") {
        if (!logoutLoading) {
          handleForcedLogout();
        }
      }
    });

    setUserDocUnsubscribe(() => unsubscribe);

    return () => {
      unsubscribe();
    };
  }, [currentUser, logoutLoading]);

  const handleForcedLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Error during forced logout:", err);
    } finally {
      setLogoutLoading(false);
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  dotWave.register();
  spiral.register();
  metronome.register();
  lineSpinner.register();

  const handleLogout = async () => {
    setLogoutLoading(true);
    if (userDocUnsubscribe) userDocUnsubscribe();

    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        status: "offline",
      });
    }
    await auth.signOut();
    setLogoutLoading(false);
    navigate("/login");
  };

  const useInactivityLogout = (timeoutDuration = 300000) => {
    useEffect(() => {
      const resetInactivityTimer = () => {
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(handleLogout, timeoutDuration);
      };
      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keydown", resetInactivityTimer);
      resetInactivityTimer();
      return () => {
        clearTimeout(inactivityTimeout);
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("keydown", resetInactivityTimer);
      };
    }, [timeoutDuration]);
  };
  useInactivityLogout();

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    if (userDocUnsubscribe) userDocUnsubscribe();

    const auth = getAuth();
    const db = getFirestore();
    const user = auth.currentUser;

    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const quizScoresRef = collection(db, "users", user.uid, "quizScores");
        const quizScoresSnapshot = await getDocs(quizScoresRef);
        const deletePromises = quizScoresSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        await deleteDoc(userDocRef);
        await deleteUser(user);

        alert("Account and data deleted successfully.");
        setDeleteLoading(false);
        navigate("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. You may need to re-authenticate.");
        setDeleteLoading(false);
      }
    } else {
      alert("No user is signed in.");
      setDeleteLoading(false);
    }
  };

  const handleUpdateProgramOfStudy = async () => {
    setProgramLoading(true);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        programOfStudy: programOfStudy,
        selectedElectives: [],
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        programOfStudy: programOfStudy,
      }));
      alert("Program of Study updated");
      setProgramLoading(false);
    }
  };

  const handleUpdateLevelOfStudy = async () => {
    setLevelLoading(true);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        levelOfStudy: levelOfStudy,
        selectedElectives: [],
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        levelOfStudy: levelOfStudy,
      }));
      alert("Level of Study updated");
    }
    setLevelLoading(false);
  };

  const handleUpdateContact = async () => {
    setContactLoading(true);
    if (currentUser && userNumber.trim() !== "") {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        userNumber: userNumber.trim(),
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        userNumber: userNumber.trim(),
      }));
      alert("Contact number updated");
    } else {
      alert("Please enter a valid contact number.");
    }
    setContactLoading(false);
  };

  const handleUpdateSemesterOfStudy = async () => {
    setSemesterLoading(true);
    if (currentUser) {
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        semesterOfStudy: semesterOfStudy,
        selectedElectives: [],
      });
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        semesterOfStudy: semesterOfStudy,
      }));
      alert("Semester of Study updated");
    }
    setSemesterLoading(false);
  };

  const handleRecord = async () => {
    setRecordLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    navigate("/record");
    setRecordLoading(false);
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <p style={{ fontSize: "36px", color: "blue" }}>
          Loading Profile{" "}
          <l-metronome size="40" speed="1.6" color="blue"></l-metronome>
        </p>
      </div>
    );
  }

  if (recordLoading) {
    return (
      <div className="spinner-container">
        <p style={{ fontSize: "36px", color: "blue" }}>
          Loading Records{" "}
          <l-line-spinner
            size="40"
            stroke="3"
            speed="1"
            color="blue"
          ></l-line-spinner>
        </p>
      </div>
    );
  }

  if (logoutLoading) {
    return (
      <div className="spinner-container">
        <p>Logging out...</p>
        <l-spiral size="40" speed="0.9" color="blue"></l-spiral>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.profileTitle}>Profile Details</h3>
      <div style={styles.contain}>
        <div style={styles.profileCard}>
          <div style={styles.profilePictureContainer}>
            <img
              src={logo}
              alt="Study Group Logo"
              style={styles.profilePicture}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-user" style={styles.icon}></i>Username:
            </label>
            <input
              type="text"
              value={userDetails.username}
              readOnly
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-envelope" style={styles.icon}></i>Email:
            </label>
            <input
              type="email"
              value={userDetails.email}
              readOnly
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-phone" style={styles.icon}></i>Contact Number:
            </label>
            <input
              type="tel"
              value={userNumber}
              onChange={(e) => setUserNumber(e.target.value)}
              placeholder="Enter contact number"
              style={styles.contactInput}
            />
          </div>
          <button
            onClick={handleUpdateContact}
            style={styles.updateButton2}
            disabled={contactLoading}
          >
            {contactLoading ? (
              <div className="spinner-button">
                Updating{" "}
                <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
              </div>
            ) : (
              "Update Contact Number"
            )}
          </button>
          <button onClick={() => navigate(-1)} style={styles.goBackButton}>
            <FaArrowLeft style={styles.icon} /> Go Back
          </button>
          <div style={styles.update}>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={styles.logoutButton}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="spinner-button">
                  Deleting{" "}
                  <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                </div>
              ) : (
                <>
                  <FaTrash style={styles.icon} /> Delete Account
                </>
              )}
            </button>
            <button onClick={handleLogout} style={styles.logoutButton}>
              <FaSignOutAlt style={styles.icon} /> Logout
            </button>
          </div>
        </div>
        <div style={styles.profileCard}>
          <div style={styles.profilePictureContainer}>
            <img
              src={logo1}
              alt="Study Group Logo"
              style={styles.profilePicture}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-graduation-cap" style={styles.icon}></i>
              Program of Study:
            </label>
            <div
              style={styles.dropdownContainer}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div style={styles.programInput}>
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
                        setProgramOfStudy(program);
                        setIsOpen(false);
                      }}
                    >
                      {program}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-list-ol" style={styles.icon}></i>Level of
              Study:
            </label>
            <select
              value={levelOfStudy}
              onChange={(e) => setLevelOfStudy(e.target.value)}
              style={styles.programInput}
            >
              <option value="">Select Level</option>
              <option value="Level 100">Level 100</option>
              <option value="Level 200">Level 200</option>
              <option value="Level 300">Level 300</option>
              <option value="Level 400">Level 400</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              <i className="fa fa-calendar" style={styles.icon}></i>Semester of
              Study:
            </label>
            <select
              value={semesterOfStudy}
              onChange={(e) => setSemesterOfStudy(e.target.value)}
              style={styles.programInput}
            >
              <option value="">Select Semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>
          <button
            onClick={handleUpdateProgramOfStudy}
            style={styles.updateButton2}
            disabled={programLoading}
          >
            {programLoading ? (
              <div className="spinner-button">
                Updating{" "}
                <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
              </div>
            ) : (
              "Update Program of Study"
            )}
          </button>
          <div style={styles.update}>
            <button
              onClick={handleUpdateLevelOfStudy}
              style={styles.updateButton}
              disabled={levelLoading}
            >
              {levelLoading ? (
                <div className="spinner-button">
                  Updating{" "}
                  <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                </div>
              ) : (
                "Update Level"
              )}
            </button>
            <button
              onClick={handleUpdateSemesterOfStudy}
              style={styles.updateButton}
              disabled={semesterLoading}
            >
              {semesterLoading ? (
                <div className="spinner-button">
                  Updating{" "}
                  <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
                </div>
              ) : (
                "Update Semester"
              )}
            </button>
          </div>
          <button onClick={handleRecord} style={styles.recordButton}>
            <i className="fa fa-trophy"></i> My Achievements{" "}
            <i className="fa fa-trophy"></i>
          </button>
        </div>
      </div>
      <div style={styles.scrollingContainer}>
        <div style={styles.scrollingText}>
          🌟 Every small effort you make today builds the success of tomorrow.
          Keep pushing, keep learning — your dreams are worth it! 🌟 Your
          journey matters. Keep striving, keep growing. Prime Academy believes
          in you! 🌟 Success is the sum of small efforts repeated every day.
          Keep pushing! 🌟 You’re not just studying — you’re building a future
          to be proud of. 🌟 Every quiz you take is one step closer to mastering
          your field! 🌟 &nbsp;&nbsp;&nbsp;&nbsp; 🌟 Every small effort you make
          today builds the success of tomorrow. Keep pushing, keep learning —
          your dreams are worth it! 🌟 Your journey matters. Keep striving, keep
          growing. Prime Academy believes in you! 🌟 Success is the sum of small
          efforts repeated every day. Keep pushing! 🌟 You’re not just studying
          — you’re building a future to be proud of. 🌟 Every quiz you take is
          one step closer to mastering your field! 🌟
        </div>
      </div>
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ textDecoration: "underline", textAlign: "center" }}>
              Confirm Deletion
            </h3>
            <p>
              Are you sure you want to permanently delete your account and all
              data?
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ ...styles.modalButton, ...styles.cancelButton }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  handleDeleteAccount();
                }}
                disabled={deleteLoading}
                style={{
                  ...styles.modalButton,
                  ...styles.deleteConfirmButton,
                  ...(deleteLoading
                    ? { opacity: 0.7, cursor: "not-allowed" }
                    : {}),
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "90px",
  },
  contain: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    height: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  },
  logoutButton: {
    backgroundColor: "#FF4C4C",
    padding: "10px 20px",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    width: "48%",
  },
  dropdownContainer: {
    width: "96.5%",
    fontSize: "20px",
    borderRadius: "5px",
    backgroundColor: "white",
    cursor: "pointer",
    position: "relative",
  },
  dropdownMenu: {
    position: "absolute",
    width: "103%",
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
  recordButton: {
    backgroundColor: "#FFD700",
    color: "white",
    border: "none",
    borderRadius: "50px",
    padding: "10px 15px",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    gap: "10px",
    transition: "background-color 0.3s",
    width: "100%",
    fontWeight: "800",
    marginTop: "10px",
    justifyContent: "center",
  },
  goBackButton: {
    backgroundColor: "#4CAF50",
    padding: "10px 20px",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
  },
  updateButton: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    width: "48%",
  },
  updateButton1: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
  },
  updateButton2: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "800",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    marginTop: "10px",
    width: "100%",
  },
  update: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileCard: {
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: "10px",
    width: "48%",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
  },
  profileTitle: {
    textAlign: "center",
    fontSize: "50px",
    fontWeight: "900",
    color: "#333",
    marginBottom: "5px",
    textTransform: "uppercase",
    boxShadow: "0 4px 8px rgba(0,0,0,0.8)",
    borderRadius: "10px",
    padding: "20px",
    width: "80%",
  },
  profilePictureContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  profilePicture: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  inputGroup: {
    marginBottom: "10px",
    width: "100%",
  },
  input: {
    width: "96%",
    padding: "12px",
    fontSize: "20px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    cursor: "not-allowed",
    marginTop: "10px",
  },
  contactInput: {
    width: "96%",
    padding: "12px",
    fontSize: "20px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    cursor: "text",
    marginTop: "10px",
    marginBottom: "2.5px",
  },
  programInput: {
    width: "96%",
    padding: "12px",
    fontSize: "20px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    cursor: "pointer",
    marginTop: "10px",
    maxHeight: "200px",
    overflowY: "auto",
  },
  buttonContainer: {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    backgroundColor: "#fff",
    padding: "10px 0",
    boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  label: {
    fontSize: "20px",
  },
  icon: {
    fontSize: "15px",
    marginRight: "8px",
  },
  scrollingContainer: {
    position: "fixed",
    bottom: 10,
    left: 0,
    width: "100%",
    height: "40px",
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 -8px 10px rgba(0,0,0,0.5)",
    animation: "flyIn 1.5s ease-out",
  },
  scrollingText: {
    display: "inline-block",
    whiteSpace: "nowrap",
    fontSize: "20px",
    color: "#333",
    animation: "scrollText 60s linear infinite",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    background: "white",
    padding: "2rem",
    borderRadius: "10px",
    maxWidth: "400px",
    width: "90%",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1rem",
  },
  modalButton: {
    padding: "10px 16px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
    color: "#333",
    marginRight: "10px",
  },
  deleteConfirmButton: {
    backgroundColor: "#d32f2f",
    color: "#fff",
  },
  deleteConfirmButtonHover: {
    backgroundColor: "#b71c1c",
  },
};

const globalStyles = `
  @keyframes scrollText {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  @keyframes flyIn {
    0% {
      transform: translateY(100%);
      opacity: 0;
    }
    100% {
      transform: translateY(0%);
      opacity: 1;
    }
  }
`;

export default Profile;
