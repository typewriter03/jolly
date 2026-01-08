import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  // 🔴 PASTE YOUR REAL KEYS HERE 🔴
  apiKey: "AIzaSyCyQ7SOnIkmNBBOsE_ax71uTH5TAc97sIE",
  authDomain: "legal-ai-app-2c8c8.firebaseapp.com",
  projectId: "legal-ai-app-2c8c8",
  storageBucket: "legal-ai-app-2c8c8.firebasestorage.app",
  messagingSenderId: "733959007308",
  appId: "1:733959007308:web:3d7f0b9570b81c763a18e9",
  measurementId: "G-SJH1BLW82X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Login Error:", error);
    alert("Login failed: " + error.message);
  }
};

export const logout = async () => {
  await signOut(auth);
};