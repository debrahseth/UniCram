// src/firebase.js
import { initializeApp } from 'firebase/app';  // Import the necessary functions from firebase
import { getAuth } from 'firebase/auth'; // Import the auth function
import { getFirestore } from 'firebase/firestore'; // Import the Firestore function

const firebaseConfig = {
  apiKey: "AIzaSyDEYO8XGy3goKfyiqY1Q5_m62Q5PndNRHg",
  authDomain: "group-83349.firebaseapp.com",
  projectId: "group-83349",
  storageBucket: "group-83349.firebasestorage.app",
  messagingSenderId: "699263921298",
  appId: "1:699263921298:web:f985676999d76f0ee0ca4f",
  measurementId: "G-K37KS1KCDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // Initialize the app with your configuration

// Get the auth instance
const auth = getAuth(app);

// Get the Firestore instance
const db = getFirestore(app);

export { auth, db }; // Export the auth and db instances
