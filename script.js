// Firebase Setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// Initialize Firebase
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

// HTML Elements
const authSection = document.getElementById("auth-section");
const signupSection = document.getElementById("signup-section");
const vaultSection = document.getElementById("vault-section");
const vaultItemsDiv = document.getElementById("vaultItems");

// Login Handler
document.getElementById("loginBtn").onclick = () => {
    const email = document.getElementById("loginEmail").value;
    const pass = document.getElementById("loginPassword").value;
    signInWithEmailAndPassword(auth, email, pass)
        .then(() => {
            // After login, prompt for secret key
            const secretKey = prompt("Enter your secret key");
            if (hashSecretKey(secretKey) === storedSecretKey) {
                showVault();
            } else {
                alert("Incorrect key!");
                signOut(auth); // Log out user if key is incorrect
            }
        })
        .catch(err => alert(err.message));
};

// Sign Up Handler
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

// Switch to Sign Up Section
document.getElementById("showSignup").onclick = () => {
    authSection.style.display = "none";
    signupSection.style.display = "block";
};

// Switch to Login Section
document.getElementById("showLogin").onclick = () => {
    signupSection.style.display = "none";
    authSection.style.display = "block";
};

// Logout Handler
document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    vaultSection.style.display = "none";
    authSection.style.display = "block";
};

// Add Vault Item
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

// Render Vault Items
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

// Show Vault
const showVault = () => {
    authSection.style.display = "none";
    signupSection.style.display = "none";
    vaultSection.style.display = "block";
    const q = query(collection(db, "vault"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
        renderVaultItems(items);
    });
};

// Delete Vault Item
vaultItemsDiv.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
        await deleteDoc(doc(db, "vault", e.target.dataset.id));
    }
});

// Hash secret key (SHA-512)
const storedSecretKey = "gypsy"; // Store this securely or use Firebase for storage
const hashSecretKey = (key) => {
    const sha512 = new jsSHA("SHA-512", "TEXT");
    sha512.update(key);
    return sha512.getHash("HEX");
};

// Authentication State Listener
onAuthStateChanged(auth, user => {
    if (user) {
        // If user is authenticated, prompt for secret key
        const secretKey = prompt("Enter your secret key");
        if (hashSecretKey(secretKey) === storedSecretKey) {
            showVault();
        } else {
            alert("Incorrect key!");
            signOut(auth);
        }
    } else {
        vaultSection.style.display = "none";
        authSection.style.display = "block";
    }
});

