import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAojNXC_EN5CEk4AFYnwgdXA4kn7uztUa4",
  authDomain: "true-alpha-topup.firebaseapp.com",
  projectId: "true-alpha-topup",
  storageBucket: "true-alpha-topup.firebasestorage.app",
  messagingSenderId: "818938992681",
  appId: "1:818938992681:web:6ebc2aa9471770e0b66438"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
