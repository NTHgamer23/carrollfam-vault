import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

// Initialize Firebase
const auth = getAuth();
const db = getFirestore();

// DOM Elements
const vaultSection = document.getElementById('vaultSection');
const authSection = document.getElementById('authSection');
const signupSection = document.getElementById('signupSection');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const vaultItemsList = document.getElementById('vaultItemsList'); // Assume this is for displaying vault items

let unsubscribe = null; // Store the unsubscribe function globally

// Handle user logout
logoutBtn.onclick = () => {
  signOut(auth).then(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    vaultSection.style.display = "none";
    authSection.style.display = "block";
  }).catch(err => {
    console.error("Error signing out:", err);
  });
};

// Auth state change listener
onAuthStateChanged(auth, user => {
  if (user) {
    showVault(); // Show the vault if authenticated
  } else {
    vaultSection.style.display = "none";
    authSection.style.display = "block";
    if (unsubscribe) {
      unsubscribe();
    }
  }
});

// Function to display the vault and set up Firestore listener
const showVault = () => {
  authSection.style.display = "none";
  signupSection.style.display = "none";
  vaultSection.style.display = "block";

  if (unsubscribe) {
    unsubscribe();
  }

  const q = query(collection(db, "vault"), where("userId", "==", auth.currentUser.uid));
  unsubscribe = onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    renderVaultItems(items); // Call function to render vault items
  });
};

// Function to render the vault items
const renderVaultItems = (items) => {
  vaultItemsList.innerHTML = ''; // Clear previous items
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `Item ID: ${item.id}, Data: ${JSON.stringify(item)}`;
    vaultItemsList.appendChild(li);
  });
};

// Login form submission
loginForm.onsubmit = (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Login successful
      console.log('Logged in as:', userCredential.user);
      emailInput.value = '';
      passwordInput.value = '';
    })
    .catch((error) => {
      console.error('Error during login:', error);
    });
};

// Signup form submission
signupForm.onsubmit = (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Sign up successful
      console.log('Signed up as:', userCredential.user);
      emailInput.value = '';
      passwordInput.value = '';
    })
    .catch((error) => {
      console.error('Error during signup:', error);
    });
};
