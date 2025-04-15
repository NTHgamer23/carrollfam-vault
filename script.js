// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZdQx1OxvaL1Irrwx2OMRRUkAYAz4Jpio",
  authDomain: "carroll-fam-v.firebaseapp.com",
  projectId: "carroll-fam-v",
  storageBucket: "carroll-fam-v.appspot.com",
  messagingSenderId: "31202730208",
  appId: "1:31202730208:web:424f6d013231a970ae3085",
  measurementId: "G-6L6FH62554"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const authSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const vaultSection = document.getElementById("vault-section");
const vaultItemsDiv = document.getElementById("vaultItems");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const showSignupBtn = document.getElementById("showSignup");
const showLoginBtn = document.getElementById("showLogin"); // FIXED: Correct ID
const logoutBtn = document.getElementById("logoutBtn");
const addVaultBtn = document.getElementById("addVaultBtn");
const createFamilyBtn = document.getElementById("createFamilyBtn");
const joinFamilyBtn = document.getElementById("joinFamilyBtn");

// Error message elements
const loginErrorElement = document.getElementById("loginError");
const signupErrorElement = document.getElementById("signupError");
const familyErrorElement = document.getElementById("familyError");

// Utility: Display error
function displayErrorMessage(element, message) {
  element.textContent = message;
  element.style.display = "block";
}
// Utility: Clear error
function clearErrorMessage(element) {
  element.textContent = "";
  element.style.display = "none";
}

// --- Authentication ---
// Login
const loginUser = async () => {
  clearErrorMessage(loginErrorElement);
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  if (!email.trim()) {
    displayErrorMessage(loginErrorElement, "Please enter your email address.");
    return;
  }
  if (!password.trim()) {
    displayErrorMessage(loginErrorElement, "Please enter your password.");
    return;
  }
  loginBtn.disabled = true;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    // Success: UI will update via onAuthStateChanged
  } catch (error) {
    displayErrorMessage(loginErrorElement, "Login Failed: " + error.message);
  }
  loginBtn.disabled = false;
};
loginBtn.onclick = loginUser;

// Signup
const signUpUser = async () => {
  clearErrorMessage(signupErrorElement);
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  if (!email.trim()) {
    displayErrorMessage(signupErrorElement, "Please enter an email address.");
    return;
  }
  if (!password.trim() || password.length < 6) {
    displayErrorMessage(signupErrorElement, "Password must be at least 6 characters.");
    return;
  }
  signupBtn.disabled = true;
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    await db.collection("users").doc(user.uid).set({
      email: email,
      familyId: null,
    });
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    alert("Account created! Please log in.");
    signupSection.style.display = "none";
    authSection.style.display = "block";
  } catch (error) {
    displayErrorMessage(signupErrorElement, "Signup Failed: " + error.message);
  }
  signupBtn.disabled = false;
};
signupBtn.onclick = signUpUser;

// Toggle Sections
showSignupBtn.onclick = () => {
  authSection.style.display = "none";
  signupSection.style.display = "block";
};
showLoginBtn.onclick = () => {
  signupSection.style.display = "none";
  authSection.style.display = "block";
};

// --- Vault ---
// Add Item to Vault
const addVaultItem = async () => {
  const item = document.getElementById("vaultInput").value;
  if (!item.trim()) return;
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to add items.");
    return;
  }
  try {
    await db.collection("vaults").doc(user.uid).collection("items").add({
      item: item,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    loadVaultItems();
  } catch (error) {
    alert("Error adding item: " + error.message);
  }
};
addVaultBtn.onclick = addVaultItem;

// Load Vault Items
const loadVaultItems = async () => {
  const user = auth.currentUser;
  if (!user) return;
  vaultItemsDiv.innerHTML = "";
  try {
    const snapshot = await db.collection("vaults").doc(user.uid).collection("items").orderBy("timestamp").get();
    snapshot.forEach(doc => {
      const item = doc.data();
      const div = document.createElement("div");
      div.classList.add("vault-item");
      div.innerHTML = `${item.item}<button class="delete-btn" onclick="deleteVaultItem('${doc.id}')">Delete</button>`;
      vaultItemsDiv.appendChild(div);
    });
  } catch (error) {
    alert("Error loading items: " + error.message);
  }
};

// Delete Item from Vault
const deleteVaultItem = async (itemId) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    await db.collection("vaults").doc(user.uid).collection("items").doc(itemId).delete();
    loadVaultItems();
  } catch (error) {
    alert("Error deleting item: " + error.message);
  }
};

// --- Family Management ---
// Create Family
const createFamily = async () => {
  const familyName = document.getElementById("familyNameInput").value;
  if (!familyName.trim()) return;
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to create a family.");
    return;
  }
  try {
    const familyDoc = await db.collection("families").add({
      name: familyName,
      members: [user.uid],
    });
    await db.collection("users").doc(user.uid).update({
      familyId: familyDoc.id,
    });
    alert("Family created successfully!");
    loadFamily();
  } catch (error) {
    displayErrorMessage(familyErrorElement, "Error creating family: " + error.message);
  }
};
createFamilyBtn.onclick = createFamily;

// Join Family
const joinFamily = async () => {
  const familyId = document.getElementById("familyIdInput").value;
  if (!familyId.trim()) return;
  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to join a family.");
    return;
  }
  try {
    const familyDoc = await db.collection("families").doc(familyId).get();
    if (!familyDoc.exists) {
      displayErrorMessage(familyErrorElement, "Family not found.");
      return;
    }
    const familyData = familyDoc.data();
    await db.collection("families").doc(familyId).update({
      members: [...familyData.members, user.uid],
    });
    await db.collection("users").doc(user.uid).update({
      familyId: familyId,
    });
    alert("You joined the family!");
    loadFamily();
  } catch (error) {
    displayErrorMessage(familyErrorElement, "Error joining family: " + error.message);
  }
};
joinFamilyBtn.onclick = joinFamily;

// --- User State Management ---
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.style.display = "none";
    signupSection.style.display = "none";
    vaultSection.style.display = "block";
    loadVaultItems();
  } else {
    authSection.style.display = "block";
    signupSection.style.display = "none";
    vaultSection.style.display = "none";
  }
});
