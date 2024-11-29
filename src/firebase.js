import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDEYO8XGy3goKfyiqY1Q5_m62Q5PndNRHg",
  authDomain: "group-83349.firebaseapp.com",
  projectId: "group-83349",
  storageBucket: "group-83349.firebasestorage.app",
  messagingSenderId: "699263921298",
  appId: "1:699263921298:web:f985676999d76f0ee0ca4f",
  measurementId: "G-K37KS1KCDP"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };