// src/hooks/useForcedLogout.js
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onSnapshot, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export const useForcedLogout = () => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribeStatus;

    const checkUserStatus = (uid) => {
      const userDocRef = doc(db, "users", uid);
      unsubscribeStatus = onSnapshot(
        userDocRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            if (userData.status === "offline") {
              handleForcedLogout();
            }
          }
        },
        (error) => {
          console.error("Error checking user status:", error);
        }
      );
    };

    const handleForcedLogout = async () => {
      try {
        setLogoutLoading(true);
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("Error during forced logout:", error);
      } finally {
        setLogoutLoading(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserStatus(user.uid);
      }
    });

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
      unsubscribeAuth();
    };
  }, [navigate]);

  return { logoutLoading };
};
