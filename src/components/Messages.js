import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowCircleLeft } from "react-icons/fa";
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

      // Sort messages by timestamp (newest first)
      userMessages.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

      // Mark unread messages as read
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
        <h2 style={{ fontSize: "36px" }}>YOUR MESSAGES</h2>
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
      <div style={styles.footer}>
        <p>© 2025 StudyGroup. All rights reserved.</p>
      </div>
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
  footer: {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "100%",
    padding: "15px",
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    fontSize: "1.1rem",
    fontFamily: "Poppins, sans-serif",
  },
};

export default Messages;
