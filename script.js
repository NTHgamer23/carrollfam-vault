import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, deleteDoc, doc, query, where,
  onSnapshot, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyDZdQx1OxvaL1Irrwx2OMRRUkAYAz4Jpio",
  authDomain: "carroll-fam-v.firebaseapp.com",
  projectId: "carroll-fam-v",
  storageBucket: "carroll-fam-v.appspot.com",
  messagingSenderId: "31202730208",
  appId: "1:31202730208:web:424f6d013231a970ae3085",
  measurementId: "G-6L6FH62554"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
const authSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const vaultSection = document.getElementById("vault-section");
const vaultItemsDiv = document.getElementById("vaultItems");

// Log in
document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => promptSecretKey())
    .catch(err => alert(err.message));
};

// Sign up
document.getElementById("signupBtn").onclick = async () => {
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    const hashedKey = await bcrypt.hash("gypsy", 12);
    await setDoc(doc(db, "keys", auth.currentUser.uid), { keyHash: hashedKey });
    alert("Account created!");
    signupSection.style.display = "none";
    authSection.style.display = "block";
  } catch (err) {
    alert(err.message);
  }
};

// Prompt for secret key after login
async function promptSecretKey() {
  const inputKey = prompt("Enter your secret vault key:");

  const keyDoc = await getDoc(doc(db, "keys", auth.currentUser.uid));
  if (keyDoc.exists()) {
    const storedHash = keyDoc.data().keyHash;
    const match = await bcrypt.compare(inputKey, storedHash);
    if (match) {
      showVault();
    } else {
      alert("Wrong secret key.");
      await signOut(auth);
    }
  } else {
    alert("No secret key stored.");
    await signOut(auth);
  }
}

// Switch views
document.getElementById("showSignup").onclick = () => {
  authSection.style.display = "none";
  signupSection.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
  signupSection.style.display = "none";
  authSection.style.display = "block";
};

document.getElementById("logoutBtn").onclick = async () => {
  if (unsubscribe) unsubscribe();
  await signOut(auth);
  console.log("Logged out");
};

document.getElementById("addVaultBtn").onclick = async () => {
  const item = document.getElementById("vaultInput").value;
  if (!item) return;
  const currentUser = auth.currentUser;
  if (currentUser) {
    await addDoc(collection(db, "vault"), {
      item,
      userId: currentUser.uid
    });
    document.getElementById("vaultInput").value = "";
  }
};

const renderVaultItems = (items) => {
  vaultItemsDiv.innerHTML = "";
  items.forEach(({ id, item }) => {
    const div = document.createElement("div");
    div.className = "vault-item";
    div.innerHTML = `
      <span>${item}</span>
      <button class="btn btn-sm btn-danger" data-id="${id}">Delete</button>
    `;
    vaultItemsDiv.appendChild(div);
  });
};

let unsubscribe = null;

const showVault = () => {
  authSection.style.display = "none";
  signupSection.style.display = "none";
  vaultSection.style.display = "block";

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "vault"), where("userId", "==", auth.currentUser.uid));
  unsubscribe = onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    renderVaultItems(items);
  });
};

vaultItemsDiv.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    try {
      await deleteDoc(doc(db, "vault", e.target.dataset.id));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete item.");
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Wait for secret key prompt instead of showing vault immediately
  } else {
    vaultSection.style.display = "none";
    authSection.style.display = "block";
  }
});
