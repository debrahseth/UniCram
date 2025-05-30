import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { FaArrowCircleLeft } from "react-icons/fa";

const AdminComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const fetchAdminComplaints = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (!userDoc.exists() || userDoc.data().role !== "admin") {
          setError("Access denied. Admins only.");
          setLoading(false);
          return;
        }

        const q = query(collection(db, "complaints"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const allComplaints = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setComplaints(allComplaints);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        setError("Failed to load complaints: " + err.message);
        setLoading(false);
      }
    };

    fetchAdminComplaints();
  }, [navigate]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedComplaintId) return;

    try {
      const replyRef = doc(
        collection(db, `complaints/${selectedComplaintId}/replies`)
      );
      await setDoc(replyRef, {
        text: replyText.trim(),
        timestamp: new Date(),
      });
      setReplyText("");
      setSelectedComplaintId(null);
      alert("Reply submitted successfully!");
    } catch (err) {
      setError("Failed to submit reply: " + err.message);
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
      <h2 style={styles.title}>Admin Complaints Management</h2>
      {complaints.length === 0 ? (
        <p style={styles.noData}>No complaints submitted yet.</p>
      ) : (
        <ul style={styles.complaintList}>
          {complaints.map((complaint) => (
            <li key={complaint.id} style={styles.complaintItem}>
              <div style={styles.complaintDetails}>
                <p style={styles.complaintText}>
                  <strong>{complaint.username}</strong> ({complaint.level},{" "}
                  {complaint.program}): {complaint.text}
                </p>
                <p style={styles.timestamp}>
                  Submitted on: {complaint.timestamp.toDate().toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedComplaintId(complaint.id)}
                style={styles.replyButton}
              >
                Reply
              </button>
              {selectedComplaintId === complaint.id && (
                <form onSubmit={handleSubmitReply} style={styles.replyForm}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    style={styles.textarea}
                  />
                  <div style={styles.replyButtons}>
                    <button type="submit" style={styles.submitButton}>
                      Send Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedComplaintId(null)}
                      style={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              <div style={styles.repliesSection}>
                {complaint.replies && complaint.replies.length > 0 ? (
                  complaint.replies.map((reply, index) => (
                    <p key={index} style={styles.replyText}>
                      Admin Reply: {reply.text} (on{" "}
                      {new Date(reply.timestamp).toLocaleString()})
                    </p>
                  ))
                ) : (
                  <p style={styles.noReply}>No replies yet.</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft /> Go Back
      </button>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  title: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
  complaintList: { listStyle: "none", padding: 0 },
  complaintItem: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  complaintDetails: { marginBottom: "10px" },
  complaintText: { margin: 0, fontSize: "14px" },
  timestamp: { fontSize: "12px", color: "#666", marginTop: "5px" },
  replyButton: {
    padding: "5px 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  replyForm: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    minHeight: "80px",
    fontSize: "14px",
  },
  replyButtons: { display: "flex", gap: "10px" },
  submitButton: {
    padding: "8px 15px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "8px 15px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  repliesSection: { marginTop: "10px" },
  replyText: { margin: "5px 0", fontSize: "14px", color: "#333" },
  noReply: { fontSize: "12px", color: "#888" },
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

export default AdminComplaintsScreen;
