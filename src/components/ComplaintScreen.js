import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { FaArrowCircleLeft } from "react-icons/fa";
import logo from "../assets/op.jpg";

const ComplaintScreen = () => {
  const [complaintText, setComplaintText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchUserComplaints = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists()) {
          setError("User profile not found.");
          setLoading(false);
          return;
        }
        const userData = userDoc.data();

        const q = query(
          collection(db, "complaints"),
          where("userId", "==", auth.currentUser.uid)
        );
        const unsubscribeComplaints = onSnapshot(
          q,
          (snapshot) => {
            const userComplaints = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setComplaints(userComplaints);
            setLoading(false);
            userComplaints.forEach((complaint) => {
              const qReplies = query(
                collection(db, `complaints/${complaint.id}/replies`)
              );
              const unsubscribeReplies = onSnapshot(
                qReplies,
                (replySnapshot) => {
                  const replies = replySnapshot.docs.map((replyDoc) => ({
                    id: replyDoc.id,
                    ...replyDoc.data(),
                  }));
                  setComplaints((prevComplaints) =>
                    prevComplaints.map((c) =>
                      c.id === complaint.id ? { ...c, replies } : c
                    )
                  );
                },
                (err) => {
                  console.error(
                    `Error fetching replies for complaint ${complaint.id}:`,
                    err
                  );
                }
              );
              return () => unsubscribeReplies();
            });
          },
          (err) => {
            setError("Failed to load complaints: " + err.message);
          }
        );

        return () => unsubscribeComplaints();
      } catch (err) {
        setError("Failed to load complaints: " + err.message);
        setLoading(false);
      }
    };

    fetchUserComplaints();
  }, [navigate]);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();

    try {
      await addDoc(collection(db, "complaints"), {
        username: userData.username,
        level: userData.levelOfStudy,
        program: userData.programOfStudy,
        text: complaintText.trim(),
        timestamp: new Date(),
      });
      setComplaintText("");
      alert("Complaint submitted successfully!");
    } catch (err) {
      setError("Failed to submit complaint: " + err.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>
          <FaArrowCircleLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <h2 style={styles.title}>Submit a Complaint</h2>
      </div>
      <form onSubmit={handleSubmitComplaint} style={styles.form}>
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder="Write your complaint or worry here..."
          style={styles.textarea}
        />
        <button type="submit" style={styles.submitButton}>
          Submit Complaint
        </button>
      </form>
      <div style={styles.scrollableContainer}>
        <h3 style={styles.subtitle}>Your Complaints</h3>
        {complaints.length === 0 ? (
          <p style={styles.noData}>No complaints submitted yet.</p>
        ) : (
          <ul style={styles.complaintList}>
            {complaints.map((complaint) => (
              <li key={complaint.id} style={styles.complaintItem}>
                <p style={styles.complaintText}>{complaint.text}</p>
                <p style={styles.timestamp}>
                  Submitted on: {complaint.timestamp.toDate().toLocaleString()}
                </p>
                {complaint.replies && complaint.replies.length > 0 && (
                  <div style={styles.repliesSection}>
                    <h4 style={styles.replyTitle}>Replies</h4>
                    {complaint.replies.map((reply) => (
                      <div key={reply.id} style={styles.replyItem}>
                        <p style={styles.replyText}>
                          Admin Response: {reply.text}
                        </p>
                        <p style={styles.replyTimestamp}>
                          Replied on:{" "}
                          {reply.timestamp.toDate().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft /> Go Back
      </button>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    width: "95%",
    margin: "0 auto",
    padding: "20px",
    color: "#333",
    minHeight: "95vh",
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
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
    opacity: 0.3,
    zIndex: -1,
  },
  scrollableContainer: {
    flex: 1,
    overflowY: "auto",
    opacity: "0.9",
    maxHeight: "430px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    padding: "10px",
    width: "98%",
    boxShadow: "0 4px 4px rgba(0,0,0,0.8)",
    borderRadius: "10px",
    marginTop: "20px",
  },
  title: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    minHeight: "100px",
    fontSize: "14px",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  complaintList: { listStyle: "none", padding: 0 },
  complaintItem: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  complaintText: { margin: 0, fontSize: "14px" },
  timestamp: { fontSize: "12px", color: "#666", marginTop: "5px" },
  repliesSection: { marginTop: "10px", paddingLeft: "20px" },
  replyTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "5px" },
  replyItem: { marginBottom: "5px" },
  replyText: { margin: 0, fontSize: "14px", color: "#333" },
  replyTimestamp: { fontSize: "12px", color: "#666", marginTop: "3px" },
  noData: { color: "#888", textAlign: "center" },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginTop: "20px",
  },
};

export default ComplaintScreen;
