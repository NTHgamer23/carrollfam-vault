// Firebase Setup (Use your own config here)
const firebaseConfig = {
  apiKey: "AIzaSyDZdQx1OxvaL1Irrwx2OMRRUkAYAz4Jpio",
  authDomain: "carroll-fam-v.firebaseapp.com",
  projectId: "carroll-fam-v",
  storageBucket: "carroll-fam-v.firebasestorage.app",
  messagingSenderId: "31202730208",
  appId: "1:31202730208:web:424f6d013231a970ae3085",
  measurementId: "G-6L6FH62554"
};
firebase.initializeApp(firebaseConfig);

// DOM elements
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginMessage = document.getElementById('login-message');
const signupMessage = document.getElementById('signup-message');

// Auth State
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    window.location.href = "/vault.html";  // Redirect to Vault after login/signup
  }
});

// Login functionality
loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      window.location.href = "/vault.html";  // Redirect to Vault page
    })
    .catch(error => {
      loginMessage.textContent = `Error: ${error.message}`;
    });
});

// Sign Up functionality
signupForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      signupMessage.textContent = "Account created! Redirecting to login...";
      setTimeout(() => {
        window.location.href = '/login.html';  // Redirect to login page after successful sign-up
      }, 2000);
    })
    .catch(error => {
      signupMessage.textContent = `Error: ${error.message}`;
    });
});

// Switch between login and signup
document.getElementById('signup-btn').addEventListener('click', function() {
  loginBox.style.display = "none";
  signupBox.style.display = "block";
});

document.getElementById('login-btn').addEventListener('click', function() {
  signupBox.style.display = "none";
  loginBox.style.display = "block";
});
