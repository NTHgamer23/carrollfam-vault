// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

const loginSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const vaultSection = document.getElementById("vault-section");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const vaultInput = document.getElementById("vaultInput");
const addVaultBtn = document.getElementById("addVaultBtn");
const vaultItems = document.getElementById("vaultItems");

const createFamilyBtn = document.getElementById("createFamilyBtn");
const joinFamilyBtn = document.getElementById("joinFamilyBtn");
const familyNameInput = document.getElementById("familyNameInput");
const familyIdInput = document.getElementById("familyIdInput");

showSignup.onclick = () => {
  loginSection.style.display = "none";
  signupSection.style.display = "block";
};
showLogin.onclick = () => {
  signupSection.style.display = "none";
  loginSection.style.display = "block";
};

signupBtn.onclick = async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "vaults", userCred.user.uid), { items: [] });
    alert("Account created successfully!");
  } catch (err) {
    alert(err.message);
  }
};

loginBtn.onclick = async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    vaultSection.style.display = "block";
    watchVault(user.uid);
  } else {
    loginSection.style.display = "block";
    signupSection.style.display = "none";
    vaultSection.style.display = "none";
  }
});

function watchVault(uid) {
  const vaultRef = doc(db, "vaults", uid);
  onSnapshot(vaultRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      vaultItems.innerHTML = "";
      data.items?.forEach((item) => {
        const div = document.createElement("div");
        div.className = "vault-item";
        div.textContent = item;
        vaultItems.appendChild(div);
      });
    }
  });
}

addVaultBtn.onclick = async () => {
  const item = vaultInput.value.trim();
  if (item && auth.currentUser) {
    try {
      const vaultRef = doc(db, "vaults", auth.currentUser.uid);
      await updateDoc(vaultRef, {
        items: arrayUnion(item),
      });
      console.log(`Item "${item}" added to the vault`);
      vaultInput.value = ""; // Clear the input field
    } catch (error) {
      console.error("Error adding item to vault:", error.message);
      alert("Failed to add item to vault. Try again.");
    }
  } else {
    console.log("No item or user is not authenticated.");
    alert("Please enter an item or log in.");
  }
};

createFamilyBtn.onclick = async () => {
  const name = familyNameInput.value.trim();
  if (name && auth.currentUser) {
    const familyId = crypto.randomUUID();
    await setDoc(doc(db, "families", familyId), {
      name,
      members: [auth.currentUser.uid],
    });
    alert(`Family Created! ID: ${familyId}`);
  }
};

joinFamilyBtn.onclick = async () => {
  const familyId = familyIdInput.value.trim();
  if (familyId && auth.currentUser) {
    const familyRef = doc(db, "families", familyId);
    const snap = await getDoc(familyRef);
    if (snap.exists()) {
      await updateDoc(familyRef, {
        members: arrayUnion(auth.currentUser.uid),
      });
      alert("Joined family!");
    } else {
      alert("Family not found.");
    }
  }
};
