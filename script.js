// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZdQx1OxvaL1Irrwx2OMRRUkAYAz4Jpio",
  authDomain: "carroll-fam-v.firebaseapp.com",
  databaseURL: "https://carroll-fam-v-default-rtdb.firebaseio.com",
  projectId: "carroll-fam-v",
  storageBucket: "carroll-fam-v.firebasestorage.app",
  messagingSenderId: "31202730208",
  appId: "1:31202730208:web:424f6d013231a970ae3085",
  measurementId: "G-6L6FH62554"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Get DOM elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Handle Google login
loginBtn.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User logged in:", user);

    // Store user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      lastLogin: new Date(),
    });

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } catch (error) {
    console.error("Error signing in with Google:", error.message);
  }
});

// Handle logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    console.log("User logged out");

    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
});

// Check if user is already logged in on page load
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("User is logged in:", user);
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    console.log("No user logged in.");
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
});
