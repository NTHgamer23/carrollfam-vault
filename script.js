// Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "carroll-fam-v.firebaseapp.com",
  projectId: "carroll-fam-v",
  storageBucket: "carroll-fam-v.appspot.com",
  messagingSenderId: "31202730208",
  appId: "1:31202730208:web:424f6d013231a970ae3085",
  measurementId: "G-6L6FH62554"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function showSignup() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('signup-box').style.display = 'block';
}

function showLogin() {
  document.getElementById('signup-box').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
}

// Login Function
function login(event) {
  event.preventDefault();
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('login-box').style.display = 'none';
      document.getElementById('vault').style.display = 'block';
    })
    .catch((error) => {
      document.getElementById('login-error').innerText = error.message;
    });
}

// Sign Up Function
function signUp(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      showLogin();
      alert('Your account has been created! You can now log in.');
    })
    .catch((error) => {
      document.getElementById('signup-error').innerText = error.message;
    });
}

// Logout Function
function logout() {
  auth.signOut().then(() => {
    document.getElementById('vault').style.display = 'none';
    document.getElementById('login-box').style.display = 'block';
  });
}
