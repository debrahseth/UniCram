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
import logo from "../assets/original.png";
import { dotWave } from "ldrs";

const AdminComplaintsScreen = () => {
  const [complaints, setComplaints] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReplies, setOpenReplies] = useState({});
  const [submitLoadingId, setSubmitLoadingId] = useState(null);
  const navigate = useNavigate();

  const toggleReplies = (complaintId) => {
    setOpenReplies((prev) => ({
      ...prev,
      [complaintId]: !prev[complaintId],
    }));
  };

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
          allComplaints.forEach((complaint) => {
            const repliesRef = collection(
              db,
              `complaints/${complaint.id}/replies`
            );
            onSnapshot(repliesRef, (replySnapshot) => {
              const replies = replySnapshot.docs.map((replyDoc) => ({
                id: replyDoc.id,
                ...replyDoc.data(),
              }));

              setComplaints((prev) =>
                prev.map((c) => (c.id === complaint.id ? { ...c, replies } : c))
              );
            });
          });
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
    setSubmitLoadingId(selectedComplaintId);
    try {
      const replyRef = doc(
        collection(db, `complaints/${selectedComplaintId}/replies`)
      );
      await setDoc(replyRef, {
        text: replyText.trim(),
        timestamp: new Date(),
        adminId: auth.currentUser.uid,
      });
      setReplyText("");
      setSelectedComplaintId(null);
      alert("Reply submitted successfully!");
    } catch (err) {
      setError("Failed to submit reply: " + err.message);
    } finally {
      setSubmitLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ ...styles.spinnerContainer, height: "100vh" }}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
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

  dotWave.register();

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.header}>
        <h2 style={styles.title}>Admin Complaints Management</h2>
      </div>
      {complaints.length === 0 ? (
        <div style={styles.noDataContainer}>
          <p style={styles.noData}>No complaints submitted yet.</p>
        </div>
      ) : (
        <div
          style={{
            height: "70vh",
            overflowY: "auto",
            borderRadius: "8px",
          }}
        >
          <ul>
            {complaints.map((complaint) => (
              <li
                key={complaint.id}
                style={{
                  border: "none",
                  margin: "10px",
                  padding: "10px",
                  borderRadius: "5px",
                  listStyle: "none",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <p>
                    <strong>From :</strong> {complaint.username}
                    <br />
                    <strong>Program of Study:</strong> {complaint.program}
                    <br />
                    <strong>Level of Study:</strong> {complaint.level}
                    <br />
                    <strong>Complaint:</strong> {complaint.text}
                  </p>
                  {complaint.replies && complaint.replies.length > 0 && (
                    <button
                      onClick={() => toggleReplies(complaint.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      {openReplies[complaint.id] ? "▲" : "▼"}
                    </button>
                  )}
                </div>
                <p style={{ fontSize: "12px", color: "#666" }}>
                  Submitted on: {complaint.timestamp?.toDate().toLocaleString()}
                </p>

                {openReplies[complaint.id] && complaint.replies && (
                  <div style={{ marginLeft: "20px", marginTop: "10px" }}>
                    <h4>Replies</h4>
                    {complaint.replies.map((reply) => (
                      <div key={reply.id}>
                        <p>Admin: {reply.text}</p>
                        <p style={{ fontSize: "12px", color: "#666" }}>
                          Replied on:{" "}
                          {reply.timestamp?.toDate().toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={handleSubmitReply}
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <textarea
                    value={
                      selectedComplaintId === complaint.id ? replyText : ""
                    }
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      setSelectedComplaintId(complaint.id);
                    }}
                    placeholder="Write a reply..."
                    style={{
                      padding: "3px",
                      borderRadius: "5px",
                      marginBottom: "5px",
                      backgroundColor: "transparent",
                      fontSize: "18px",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      alignSelf: "flex-end",
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "bold",
                      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                      transition: "background-color 0.3s ease",
                    }}
                    disabled={submitLoadingId === complaint.id}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#007bff")
                    }
                  >
                    {submitLoadingId === complaint.id ? (
                      <>
                        <l-dot-wave
                          size="20"
                          speed="1"
                          color="white"
                        ></l-dot-wave>
                      </>
                    ) : (
                      "Submit Reply"
                    )}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft /> Go Back
      </button>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    width: "98%",
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    padding: "5px",
    width: "98%",
    boxShadow: "0 4px 4px rgba(0,0,0,0.8)",
    borderRadius: "10px",
    marginTop: "20px",
  },
  title: {
    fontSize: "35px",
    fontWeight: "bold",
    marginBottom: "20px",
    textTransform: "uppercase",
  },
  noDataContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px",
    textAlign: "center",
    borderRadius: "5px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.6)",
    width: "80%",
    minHeight: "200px",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  noData: {
    color: "#000",
    fontSize: "80px",
  },
  backButton: {
    background: "none",
    cursor: "pointer",
    color: "#007bff",
    display: "flex",
    alignItems: "center",
    fontSize: "30px",
    position: "fixed",
    bottom: "35px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "8px",
    boxShadow: "0 4px 4px rgba(0,0,0,0.5)",
    borderRadius: "10px",
    width: "95%",
    justifyContent: "center",
    gap: "10px",
    fontWeight: "bolder",
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
};

export default AdminComplaintsScreen;
