import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

const authSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const vaultSection = document.getElementById("vault-section");
const keySection = document.getElementById("key-section");
const vaultItemsDiv = document.getElementById("vaultItems");

document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, pass)
    .then(() => {
      showKeyPrompt(); // Only show after successful login
    })
    .catch(err => alert("Login failed: " + err.message));
};

document.getElementById("signupBtn").onclick = () => {
  const email = document.getElementById("signupEmail").value;
  const pass = document.getElementById("signupPassword").value;

  createUserWithEmailAndPassword(auth, email, pass)
    .then(() => {
      alert("Account created!");
      signupSection.style.display = "none";
      authSection.style.display = "block";
    })
    .catch(err => alert(err.message));
};

document.getElementById("showSignup").onclick = () => {
  authSection.style.display = "none";
  signupSection.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
  signupSection.style.display = "none";
  authSection.style.display = "block";
};

document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  vaultSection.style.display = "none";
  authSection.style.display = "block";
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

const showKeyPrompt = () => {
  authSection.style.display = "none";
  signupSection.style.display = "none";
  keySection.style.display = "block";
};

document.getElementById("keySubmitBtn").onclick = () => {
  const secretKey = document.getElementById("keyInput").value.trim();
  if (secretKey === "gypsy") {
    showVault();
  } else {
    alert("Wrong key.");
    keySection.style.display = "none";
    authSection.style.display = "block";
  }
};

const showVault = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const q = query(collection(db, "vault"), where("userId", "==", currentUser.uid));
  onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    renderVaultItems(items);
  });

  keySection.style.display = "none";
  vaultSection.style.display = "block";
};

vaultItemsDiv.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    await deleteDoc(doc(db, "vault", e.target.dataset.id));
  }
});

onAuthStateChanged(auth, user => {
  if (!user) {
    vaultSection.style.display = "none";
    keySection.style.display = "none";
    authSection.style.display = "block";
  }
});

