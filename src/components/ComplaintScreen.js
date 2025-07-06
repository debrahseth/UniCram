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
import logo from "../assets/original.png";
import { dotWave } from "ldrs";

const ComplaintScreen = () => {
  const [complaintText, setComplaintText] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const navigate = useNavigate();

  const toggleReplies = (id) => {
    setOpenReplies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
    setSubmitLoading(true);
    e.preventDefault();
    if (!complaintText.trim()) return;

    const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDoc.data();

    try {
      await addDoc(collection(db, "complaints"), {
        userId: auth.currentUser.uid,
        username: userData.username,
        level: userData.levelOfStudy,
        program: userData.programOfStudy,
        text: complaintText.trim(),
        timestamp: new Date(),
        read: false,
      });
      setComplaintText("");
      alert("Complaint submitted successfully!");
      setSubmitLoading(false);
    } catch (err) {
      setError("Failed to submit complaint: " + err.message);
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
        <h2 style={styles.title}>SUBMIT A COMPLAINT</h2>
      </div>
      <form onSubmit={handleSubmitComplaint} style={styles.form}>
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder="Write your complaint or worry here..."
          style={styles.textarea}
        />
        <button
          type="submit"
          style={styles.submitButton}
          disabled={submitLoading}
        >
          {submitLoading ? (
            <>
              Submiting{" "}
              <l-dot-wave size="20" speed="1" color="white"></l-dot-wave>
            </>
          ) : (
            "Submit Complaint"
          )}
        </button>
      </form>
      <>
        <h3 style={styles.subtitle}>Your Complaints</h3>
        {complaints.length === 0 ? (
          <p style={styles.noData}>No complaints submitted yet.</p>
        ) : (
          <div style={{ display: "flex", gap: "20px" }}>
            <div
              style={{
                width: "70%",
                height: "240px",
                overflowY: "auto",
                border: "1px solid #000",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              <ul style={styles.complaintList}>
                {complaints.map((complaint) => (
                  <li key={complaint.id} style={styles.complaintItem}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <p style={styles.complaintText}>{complaint.text}</p>
                      {complaint.replies?.length > 0 && (
                        <button
                          onClick={() => toggleReplies(complaint.id)}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "18px",
                            marginLeft: "10px",
                          }}
                          title={
                            openReplies[complaint.id]
                              ? "Hide replies"
                              : "Show replies"
                          }
                        >
                          {openReplies[complaint.id] ? "▲" : "▼"}
                        </button>
                      )}
                    </div>
                    <p style={styles.timestamp}>
                      Submitted on:{" "}
                      {complaint.timestamp.toDate().toLocaleString()}
                    </p>
                    {openReplies[complaint.id] &&
                      complaint.replies?.length > 0 && (
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
            </div>
            <div
              style={{
                width: "30%",
                backgroundColor: "transparent",
                padding: "5px",
                borderRadius: "8px",
                border: "1px solid #000",
                height: "250px",
              }}
            >
              <h4
                style={{
                  fontSize: "22px",
                  textAlign: "center",
                  marginBottom: "5px",
                }}
              >
                Need Urgent Help?
              </h4>
              <p style={{ fontSize: "20px", marginBottom: "5px" }}>
                If your complaint is unresolved or needs urgent attention,
                contact the admin directly via:
              </p>
              <p>
                📧 <a href="mailto:teamunibuddy@gmail.com">Email Admin</a>
              </p>
              <p>
                💬{" "}
                <a
                  href="https://wa.me/+233544806525"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Admin
                </a>
              </p>
              <p style={{ fontSize: "18px", marginTop: "8px", color: "#000" }}>
                These links are here to help you escalate issues that require
                faster resolution.
              </p>
            </div>
          </div>
        )}
      </>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        <FaArrowCircleLeft /> GO BACK
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    padding: "10px",
    width: "98%",
    boxShadow: "0 4px 4px rgba(0,0,0,0.8)",
    borderRadius: "10px",
    marginTop: "5px",
  },
  title: {
    fontSize: "40px",
    fontWeight: "bolder",
    marginBottom: "5px",
  },
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
    minHeight: "200px",
    fontSize: "18px",
    backgroundColor: "transparent",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "20px",
    textTransform: "uppercase",
    fontWeight: "bolder",
  },
  subtitle: {
    fontSize: "20px",
    fontWeight: "bolder",
    textTransform: "uppercase",
  },
  complaintList: {
    listStyle: "none",
    padding: 0,
  },
  complaintItem: {
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  complaintText: {
    margin: 0,
    fontSize: "15px",
  },
  timestamp: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
  repliesSection: {
    marginTop: "10px",
    paddingLeft: "20px",
  },
  replyTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  replyItem: {
    marginBottom: "5px",
  },
  replyText: {
    margin: 0,
    fontSize: "14px",
    color: "#333",
  },
  replyTimestamp: {
    fontSize: "12px",
    color: "#666",
    marginTop: "3px",
  },
  noData: {
    color: "#000",
    fontSize: "40px",
    textAlign: "center",
    textTransform: "uppercase",
    fontWeight: "bolder",
  },
  backButton: {
    background: "none",
    cursor: "pointer",
    color: "#000",
    display: "flex",
    alignItems: "center",
    fontSize: "25px",
    position: "fixed",
    bottom: "35px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "15px",
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

const keyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.insertAdjacentHTML("beforeend", `<style>${keyframes}</style>`);
export default ComplaintScreen;
