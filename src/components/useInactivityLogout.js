import { useEffect } from "react";
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

const useInactivityLogout = (
  auth,
  db,
  currentUser,
  navigate,
  setLogoutLoading
) => {
  useEffect(() => {
    if (!currentUser) return;

    let inactivityTimeout;
    const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

    const setupInactivity = async () => {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role === "admin") return;

      const resetTimeout = () => {
        if (inactivityTimeout) clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(async () => {
          try {
            setLogoutLoading(true);
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, {
              status: "offline",
              lastActivity: Timestamp.fromDate(new Date()),
            });
            await signOut(auth);
            navigate("/login");
          } catch (error) {
            console.error("Error during inactivity logout:", error);
          } finally {
            setLogoutLoading(false);
          }
        }, INACTIVITY_TIMEOUT);
      };

      const events = ["mousemove", "keydown", "scroll", "touchstart"];
      events.forEach((event) => {
        window.addEventListener(event, resetTimeout);
      });
      resetTimeout();

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, resetTimeout);
        });
        if (inactivityTimeout) clearTimeout(inactivityTimeout);
      };
    };

    setupInactivity();
  }, [auth, db, currentUser, navigate, setLogoutLoading]);
};

export default useInactivityLogout;
