import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";

let inactivityTimeout;

const handleLogout = async (
  auth,
  db,
  currentUser,
  navigate,
  setLogoutLoading
) => {
  setLogoutLoading(true);
  if (currentUser) {
    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      status: "offline",
    });
  }
  await auth.signOut();
  setLogoutLoading(false);
  navigate("/login");
  setLogoutLoading(false);
};

const useInactivityLogout = (
  auth,
  db,
  currentUser,
  navigate,
  setLogoutLoading,
  timeoutDuration = 300000
) => {
  useEffect(() => {
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(
        () => handleLogout(auth, db, currentUser, navigate, setLogoutLoading),
        timeoutDuration
      );
    };
    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    resetInactivityTimer();
    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
    };
  }, [auth, db, currentUser, navigate, setLogoutLoading, timeoutDuration]);
};

export default useInactivityLogout;
