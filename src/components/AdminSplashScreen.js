import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { spiral } from "ldrs";
import logo from "../assets/original.png";

const AdminSplashScreen = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  // const [pendingMessages, setPendingMessages] = useState(0);
  const [displayedGreeting, setDisplayedGreeting] = useState("");
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "GOOD MORNING";
    else if (hour < 18) return "GOOD AFTERNOON";
    else return "GOOD EVENING";
  };

  spiral.register();

  useEffect(() => {
    const fetchAdminData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== "admin") {
            navigate("/splash");
            return;
          }
          setUsername(userData.username);
        }
        const usersSnapshot = await getDocs(collection(db, "users"));
        let nonAdminCount = 0;
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role !== "admin") {
            nonAdminCount++;
          }
        });
        setTotalUsers(nonAdminCount);

        // const textQuerySnapshot = await getDocs(collection(db, "text"));
        // let pendingCount = 0;
        // textQuerySnapshot.forEach((doc) => {
        //   const messages = doc.data().messages || [];
        //   pendingCount += messages.filter((msg) => !msg.read).length;
        // });
        // setPendingMessages(pendingCount);
      }
    };

    fetchAdminData();
    const timer = setTimeout(() => {
      setLoading(false);
      navigate("/admin-dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    if (username && !hasStartedTyping) {
      const fullText = `${getGreeting()}, ${username || "User"}!`;
      let index = -1;

      setDisplayedGreeting("");
      const typingInterval = setInterval(() => {
        setDisplayedGreeting((prev) => prev + fullText.charAt(index));
        index++;
        if (index >= fullText.length) clearInterval(typingInterval);
      }, 150);
      setHasStartedTyping(true);
    }
  }, [username, hasStartedTyping]);

  return (
    <div style={styles.container}>
      {loading ? (
        <>
          <div style={styles.content}>
            <div style={styles.leftSection}>
              <img src={logo} alt="Admin Welcome" style={styles.welcomeImage} />
            </div>
            <div style={styles.rightSection}>
              <div style={styles.textContainer}>
                <h2 style={styles.greeting}>
                  {displayedGreeting || "WELCOME, ADMIN"}
                </h2>
                <p style={styles.message}>
                  Loading Admin Dashboard... Managing Prime Academy Operations.
                </p>
                <l-spiral size="50" speed="0.9" color="white"></l-spiral>
              </div>
              <div style={styles.statsContainer}>
                <div style={styles.statBox}>
                  <h3 style={styles.statNumber}>{totalUsers}</h3>
                  <p style={styles.statLabel}>Total Users</p>
                </div>
                {/* <div style={styles.statBox}>
                  <h3 style={styles.statNumber}>{pendingMessages}</h3>
                  <p style={styles.statLabel}>Pending Messages</p>
                </div> */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <h2 style={styles.greeting}>Navigating to Admin Dashboard...</h2>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    backgroundColor: "#1a2526",
    animation: "fadeIn 2s ease-in-out",
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    maxWidth: "1200px",
    padding: "30px",
    backgroundColor: "#2c3e50",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.5)",
    borderRadius: "12px",
    opacity: 0,
    animation: "fadeIn 2s forwards",
    transform: "translateY(10px)",
  },
  leftSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  greeting: {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#ffffff",
    minHeight: "48px",
  },
  message: {
    fontSize: "22px",
    color: "#bdc3c7",
    marginBottom: "25px",
  },
  welcomeImage: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    maxHeight: "400px",
    borderRadius: "10px",
    animation: "fadeIn 2s ease-in-out",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    width: "100%",
  },
  statBox: {
    backgroundColor: "#34495e",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    width: "150px",
  },
  statNumber: {
    fontSize: "30px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: 0,
  },
  statLabel: {
    fontSize: "14px",
    color: "#bdc3c7",
    marginTop: "5px",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

export default AdminSplashScreen;
