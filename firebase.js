import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

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


// Initialiser Firebase
const app = initializeApp(firebaseConfig);


// Firebase Authentication
const auth = getAuth(app);


// Google Authentication Provider
const googleProvider = new GoogleAuthProvider();


// Email Login / Register
async function emailLogin(email, password, mode) {

  if (mode === "register") {

    return await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

  }

  return await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}


// Export
export {
  app,
  auth,
  googleProvider,

  signInWithPopup,

  emailLogin,

  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,

  signOut,
  onAuthStateChanged
};
