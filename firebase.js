import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "REPLACE",
  authDomain: "REPLACE",
  projectId: "REPLACE",
  storageBucket: "REPLACE",
  messagingSenderId: "REPLACE",
  appId: "REPLACE"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
  doc, getDoc, setDoc, updateDoc,
  collection, addDoc, getDocs, query, where, orderBy, serverTimestamp
};

