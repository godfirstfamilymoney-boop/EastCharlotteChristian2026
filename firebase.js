// 🔥 Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

// 🔐 Firebase Auth
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// 🗄️ Firestore
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// ⚠️ REPLACE THESE WITH REAL VALUES FROM FIREBASE
export const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXX",
  authDomain: "east-charlotte-christian-2026.firebaseapp.com",
  projectId: "east-charlotte-christian-2026",
  storageBucket: "east-charlotte-christian-2026.appspot.com",
  messagingSenderId: "XXXXXXXXXX",
  appId: "1:XXXXXXXX:web:XXXXXXXX"
};

// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);

// ✅ Auth + DB (THIS FIXES YOUR ERROR)
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Export helpers
export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
};
