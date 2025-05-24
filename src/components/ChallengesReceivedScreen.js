import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDoc,
  updateDoc,
  doc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { FaCheck, FaTimes, FaArrowCircleLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.jpg";

const ChallengesReceivedScreen = () => {
  const [challenges, setChallenges] = useState([]);
  const [usernames, setUsernames] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setCurrentUserId(currentUser.uid);
    }
    if (currentUserId) {
      const challengesQuery = query(
        collection(db, "challenges"),
        where("receiverId", "==", currentUserId),
        where("status", "==", "pending")
      );
      const unsubscribe = onSnapshot(challengesQuery, (snapshot) => {
        const challengeList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChallenges(challengeList);
        challengeList.forEach((challenge) => {
          if (!usernames[challenge.senderId]) {
            fetchUsername(challenge.senderId);
          }
        });
      });
      return () => unsubscribe();
    }
  }, [currentUserId]);

  const fetchUsername = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUsernames((prevUsernames) => ({
          ...prevUsernames,
          [userId]: userSnap.data().username,
        }));
      } else {
        console.error("User not found:", userId);
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const handleAcceptChallenge = async (challengeId, senderId, receiverId) => {
    try {
      const challengeRef = doc(db, "challenges", challengeId);
      await updateDoc(challengeRef, {
        status: "accepted",
      });
      console.log("Challenge accepted!");
      if (senderId && receiverId) {
        const receiverRef = doc(db, "users", receiverId);
        await updateDoc(receiverRef, { status: "busy" });
        navigate(
          `/Quiz/${challengeId}?sender=${senderId}&receiver=${receiverId}`
        );
      }
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      const challengeRef = doc(db, "challenges", challengeId);
      await updateDoc(challengeRef, {
        status: "declined",
      });
      await deleteDoc(challengeRef);
      setChallenges((prevChallenges) =>
        prevChallenges.filter((challenge) => challenge.id !== challengeId)
      );
    } catch (error) {
      console.error("Error declining challenge:", error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <div style={styles.buttonContainer}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FaArrowCircleLeft size={20} /> Go Back
          </button>
        </div>
        <div style={styles.buttonContain}>
          <button
            onClick={() => navigate("/challenge")}
            style={styles.backButton}
          >
            <i className="fa fa-rocket"></i>Send Challenges
          </button>
        </div>
        <h1
          style={{
            fontSize: "40px",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Challenges
        </h1>
      </div>
      <div style={styles.scrollableContainer}>
        {challenges.length === 0 ? (
          <p style={styles.noDataContainer}>No challenges at the moment.</p>
        ) : (
          challenges.map((challenge) => (
            <div key={challenge.id}>
              <div style={styles.content}>
                <h3 style={styles.title}>
                  {challenge.course} - {challenge.difficulty}
                </h3>
                <p style={styles.subtitle}>
                  Challenge sent by:{" "}
                  {usernames[challenge.senderId] || "Loading..."}
                </p>
                <button
                  onClick={() =>
                    handleAcceptChallenge(
                      challenge.id,
                      challenge.senderId,
                      currentUserId
                    )
                  }
                  style={styles.acceptButton}
                >
                  <FaCheck style={{ marginRight: "8px" }} />
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineChallenge(challenge.id)}
                  style={styles.declineButton}
                >
                  <FaTimes style={{ marginRight: "8px" }} />
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${logo})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    opacity: 0.5,
    zIndex: -1,
  },
  header: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#FFD700",
    padding: "20px",
    top: "10px",
    borderRadius: "8px 8px 10px 10px",
    position: "relative",
    zIndex: 1,
    opacity: 0.8,
  },
  backButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 15px",
    fontSize: "25px",
    margin: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.3s",
  },
  buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "20px",
  },
  buttonContain: {
    position: "absolute",
    top: "40px",
    right: "20px",
  },
  noDataContainer: {
    fontSize: "36px",
    color: "#000000",
    fontWeight: 900,
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "20px",
    opacity: "0.8",
    width: "95%",
    padding: "30px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  title: {
    fontSize: "30px",
  },
  subtitle: {
    fontSize: "25px",
    fontWeight: 700,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "95%",
    padding: "20px",
    marginLeft: "10px",
    zIndex: 2,
    opacity: 0.9,
    flex: 1,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.9)",
  },
  acceptButton: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  declineButton: {
    padding: "10px 20px",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
  },
  scrollableContainer: {
    flex: 1,
    marginTop: "20px",
    marginBottom: "10px",
    justifyContent: "center",
    overflowY: "auto",
    opacity: "0.9",
    width: "100%",
  },
};

export default ChallengesReceivedScreen;
