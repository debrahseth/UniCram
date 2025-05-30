import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaEnvelope } from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import logo from "../assets/op.jpg";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [textUnreadCount, setTextUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const messagesQuery = query(
      collection(db, "messages"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const userMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      userMessages.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
      userMessages.forEach(async (message) => {
        if (!message.read) {
          const messageRef = doc(db, "messages", message.id);
          await updateDoc(messageRef, { read: true });
        }
      });

      setMessages(userMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const textQuery = query(
      collection(db, "text"),
      where("userIds", "array-contains", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(textQuery, (querySnapshot) => {
      let unread = 0;
      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        const messages = conversation.messages || [];
        messages.forEach((message) => {
          if (
            message.senderId !== auth.currentUser.uid &&
            message.read === false
          ) {
            unread++;
          }
        });
      });
      setTextUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Loading Messages...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <div style={styles.buttonContainer}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FaArrowCircleLeft size={20} /> Go Back
          </button>
        </div>
        <h2 style={{ fontSize: "36px" }}>MESSAGES FROM PRIME ACADEMY ADMIN</h2>
        <div style={styles.messageButtonContainer}>
          <button
            onClick={() => navigate("/texting")}
            style={styles.messageButton}
          >
            <FaEnvelope size={20} />
            Send Message
            {textUnreadCount > 0 && (
              <span style={styles.badge}>{textUnreadCount}</span>
            )}
          </button>
        </div>
      </div>
      <div style={styles.scrollableContainer}>
        {messages.length === 0 ? (
          <div style={styles.noDataContainer}>
            <p style={styles.noDataMessage}>No messages available.</p>
          </div>
        ) : (
          <div style={styles.messageList}>
            {messages.map((message) => (
              <div key={message.id} style={styles.messageCard}>
                <p style={styles.messageText}>{message.message}</p>
                <p style={styles.messageTimestamp}>
                  <span>Date:</span>
                  <span>
                    {" "}
                    {message.timestamp.toDate().toLocaleDateString()}
                  </span>
                  <br />
                  <span>Time:</span>
                  <span>
                    {" "}
                    {message.timestamp.toDate().toLocaleTimeString()}
                  </span>
                </p>
                <p style={styles.messageStatus}>
                  Status: {message.read ? "Read" : "Unread"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* <div style={styles.buttonContainment}>
        <button
          onClick={() => navigate("/complaint")}
          style={styles.goBackButton}
        >
          File A Complaint
        </button>
      </div> */}
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    width: "100%",
  },
  background: {
    content: '""',
    position: "fixed",
    top: 128,
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
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    zIndex: 10,
    opacity: "0.7",
  },
  scrollableContainer: {
    marginTop: "130px",
    marginBottom: "90px",
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    opacity: "0.9",
  },
  backButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    borderRadius: "30px",
    padding: "10px 14px",
    fontSize: "25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.3s",
  },
  messageButton: {
    backgroundColor: "white",
    color: "black",
    border: "2px solid black",
    borderRadius: "30px",
    padding: "10px 30px",
    fontSize: "25px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "background-color 0.3s",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.5)",
  },
  messageText: {
    fontSize: "18px",
    marginBottom: "10px",
  },
  messageTimestamp: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
  },
  messageStatus: {
    fontSize: "14px",
    color: "#666",
  },
  noDataContainer: {
    padding: "20px",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "0 8px 12px rgba(0, 0, 0, 0.8)",
    position: "fixed",
    top: "30%",
    left: "50%",
    transform: "translateX(-50%)",
    width: "90%",
  },
  noDataMessage: {
    fontSize: "50px",
    color: "#555",
    fontWeight: "bolder",
  },
  buttonContainer: {
    position: "absolute",
    top: "40px",
    left: "15px",
  },
  messageButtonContainer: {
    position: "absolute",
    top: "40px",
    right: "30px",
  },
  // goBackButton: {
  //   backgroundColor: "#2196F3",
  //   color: "white",
  //   padding: "10px 10px",
  //   fontSize: "25px",
  //   fontWeight: "600",
  //   cursor: "pointer",
  //   borderRadius: "10px",
  //   marginTop: "20px",
  //   marginBottom: "20px",
  //   boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  //   transition: "background-color 0.3s ease",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   width: "60%",
  // },
  // buttonContainment: {
  //   width: "100%",
  //   position: "fixed",
  //   bottom: "0",
  //   left: "0",
  //   boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  badge: {
    position: "absolute",
    top: "15px",
    right: "5px",
    backgroundColor: "red",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default Messages;
