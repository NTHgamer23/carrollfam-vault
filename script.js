import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

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

// Function for user login
const loginUser = async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully!");
  } catch (error) {
    console.error("Login Error:", error.message);
    alert(`Login Failed: ${error.message}`); // Improved user feedback
  }
};
document.getElementById("loginBtn").onclick = loginUser;

// Function for user signup
const signUpUser = async () => {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document in the "users" collection
    await setDoc(doc(db, "users", user.uid), { // Use setDoc
      email: email, // Store the email
      familyId: null, // Initialize familyId
      // Add any other user data you want to store here
    });

    console.log("Account created successfully!");
    alert("Account created! Please log in."); // Provide login instruction
    signupSection.style.display = "none";
    authSection.style.display = "block";
  } catch (error) {
    console.error("Signup Error:", error.message);
    alert(`Signup Failed: ${error.message}`); // Detailed error message
  }
};
document.getElementById("signupBtn").onclick = signUpUser;

document.getElementById("showSignup").onclick = () => {
  authSection.style.display = "none";
  signupSection.style.display = "block";
};

document.getElementById("showLogin").onclick = () => {
  signupSection.style.display = "none";
  authSection.style.display = "block";
};

// Function for user logout
const logoutUser = async () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
    console.log("Snapshot listener unsubscribed.");
  }
  try {
    await signOut(auth);
    console.log("User logged out successfully!");
  } catch (error) {
    console.error("Logout Error:", error.message);
    alert(`Logout Failed: ${error.message}`);
  }
};
document.getElementById("logoutBtn").onclick = logoutUser;

// Function to add item to vault
const addVaultItem = async () => {
  const item = document.getElementById("vaultInput").value;
  if (!item) {
    alert("Please enter an item to add to the vault.");
    return;
  }
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await addDoc(collection(db, "vault"), {
        item,
        userId: currentUser.uid
      });
      document.getElementById("vaultInput").value = "";
      console.log("Item added to vault:", item);
    } catch (error) {
      console.error("Error adding item:", error.message);
      alert(`Failed to add item: ${error.message}`);
    }
  }
};
document.getElementById("addVaultBtn").onclick = addVaultItem;

// Function to render vault items
const renderVaultItems = (items) => {
  vaultItemsDiv.innerHTML = "";
  items.forEach(({ id, item }) => {
    const div = document.createElement("div");
    div.className = "vault-item";
    div.innerHTML = `
      <span>${item}</span>
      <button class="btn btn-sm btn-danger delete-btn" data-id="${id}">Delete</button>
    `;
    vaultItemsDiv.appendChild(div);
  });
};

let unsubscribe = null;
// Function to show vault
const showVault = () => {
  authSection.style.display = "none";
  signupSection.style.display = "none";
  vaultSection.style.display = "block";

  if (unsubscribe) unsubscribe();
  const currentUser = auth.currentUser;
  if (currentUser) {
    const q = query(collection(db, "vault"), where("userId", "==", currentUser.uid));
    unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      renderVaultItems(items);
      console.log("Snapshot updated");
    });
  }

};

onAuthStateChanged(auth, user => {
  if (user) {
    showVault();
  } else {
    vaultSection.style.display = "none";
    authSection.style.display = "block";
  }
});

// Event listener for deleting vault items
vaultItemsDiv.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) { // Changed to class selector
    const itemId = e.target.dataset.id;
    console.log("Current user:", auth.currentUser);
    try {
      await deleteDoc(doc(db, "vault", itemId));
      console.log("Document deleted:", itemId);
    } catch (error) {
      console.error("Error deleting document:", error.message);
      alert(`Failed to delete item: ${error.message}`);
    }
  }
});



// --- Family Plan Functions ---

// Function to create a family
const createFamily = async () => {
  const familyName = document.getElementById("familyNameInput").value;
  if (!familyName) {
    alert("Please enter a family name.");
    return;
  }
  if (!auth.currentUser) {
    alert("You must be logged in to create a family.");
    return;
  }
  try {
    const user = auth.currentUser;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error("User document does not exist:", user.uid);
      alert("Error: User document not found.  Please try logging in again.");
      return; // Stop if the user doc is missing.
    }

    const familyDocRef = await addDoc(collection(db, 'families'), {
      ownerUid: user.uid,
      members: [user.uid],
      familyName: familyName,
    });

    console.log("User ID to update:", user.uid);
    await updateDoc(userDocRef, {
      familyId: familyDocRef.id,
    });
    console.log('Family created!');
    alert("Family Created!");
  } catch (error) {
    console.error('Error creating family:', error.message);
    alert(`Family creation failed: ${error.message}`);
  }
};
document.getElementById("createFamilyBtn").onclick = createFamily;

// Function to join a family
const joinFamily = async () => {
  const familyId = document.getElementById("familyIdInput").value;
  if (!familyId) {
    alert("Please enter a Family ID.");
    return;
  }
  if (!auth.currentUser) {
    alert("You must be logged in to join a family.");
    return;
  }
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
        alert("Family Joined!");
      } else {
        alert("You are already in that family.");
      }
    } else {
      alert('Family not found.');
    }
  } catch (error) {
    console.error('Error joining family:', error.message);
    alert(`Family join failed: ${error.message}`);
  }
};
document.getElementById("joinFamilyBtn").onclick = joinFamily;

