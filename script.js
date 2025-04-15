import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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
const vaultItemsDiv = document.getElementById("vaultItems");

document.getElementById("loginBtn").onclick = () => {
  const email = document.getElementById("loginEmail").value;
  const pass = document.getElementById("loginPassword").value;
  signInWithEmailAndPassword(auth, email, pass).catch(err => alert(err.message));
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
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log("Snapshot listener unsubscribed.");
  }
  await signOut(auth);
  console.log("user logged out");
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
    console.log("snapshot updated")
  });
};

vaultItemsDiv.addEventListener("click", async (e) => {
  if (e.target.tagName === "BUTTON" && e.target.dataset.id) {
    console.log("Current user:", auth.currentUser);
    try {
      await deleteDoc(doc(db, "vault", e.target.dataset.id));
      console.log("Document deleted:", e.target.dataset.id);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete item. Please check the console for details.");
    }
  }
});

onAuthStateChanged(auth, user => {
  if (user) showVault();
  else {
    vaultSection.style.display = "none";
    authSection.style.display = "block";
  }
});

// Family plan functions.

document.getElementById("createFamilyBtn").onclick = async () => {
  const familyName = document.getElementById("familyNameInput").value;
  if (!familyName) return;
  if (!auth.currentUser) return;
  try {
    const familyDocRef = await addDoc(collection(db, 'families'), {
      ownerUid: auth.currentUser.uid,
      members: [auth.currentUser.uid],
      familyName: familyName,
    });
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      familyId: familyDocRef.id,
    });
    console.log('Family created!');
    alert("Family Created")
  } catch (error) {
    console.error('Error creating family:', error);
    alert("Family creation failed.")
  }
};

document.getElementById("joinFamilyBtn").onclick = async () => {
  const familyId = document.getElementById("familyIdInput").value;
  if (!familyId) return;
  if (!auth.currentUser) return;
  try {
    const familyDocRef = doc(db, 'families', familyId);
    const familyDocSnap = await getDoc(familyDocRef);
    if (familyDocSnap.exists()) {
      const familyData = familyDocSnap.data();
      if (!familyData.members.includes(auth.currentUser.uid)) {
        await updateDoc(familyDocRef, {
          members: [...familyData.members, auth.currentUser.uid],
        });
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          familyId: familyId,
        });
        console.log('Joined family!');
        alert("Family Joined.")
      } else {
        alert("You are already in that family.")
      }
    } else {
      alert('Family not found.');
    }
  } catch (error) {
    console.error('Error joining family:', error);
    alert("Family join failed.")
  }
};
