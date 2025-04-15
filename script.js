import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

// Initialize Firestore and Firebase Auth
const db = getFirestore();
const auth = getAuth();

// Function to check if the user is authenticated
function isAuthenticated() {
  return auth.currentUser != null;
}

// Write data to Firestore (only if the user is authenticated)
async function writeToFirestore(userId, data) {
  if (isAuthenticated()) {
    const userDocRef = doc(db, 'users', userId); // Reference to the user's document
    try {
      await setDoc(userDocRef, data); // Write data to Firestore
      console.log('Document written!');
    } catch (error) {
      console.error('Error writing document:', error);
    }
  } else {
    console.error('User is not authenticated.');
  }
}

// Read data from Firestore (only if the user is authenticated)
async function readFromFirestore(userId) {
  if (isAuthenticated()) {
    const userDocRef = doc(db, 'users', userId); // Reference to the user's document
    try {
      const docSnap = await getDoc(userDocRef); // Get the document snapshot
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data()); // Log the document data
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error reading document:', error);
    }
  } else {
    console.error('User is not authenticated.');
  }
}

// Variable to store the unsubscribe function for the snapshot listener
let unsubscribeSnapshotListener = null;

// Function to set up the snapshot listener
function setupSnapshotListener(userId) {
  if (userId) {
    const collectionRef = collection(db, 'users', userId, 'userSubCollection'); // Replace with your actual collection path

    unsubscribeSnapshotListener = onSnapshot(
      collectionRef,
      (snapshot) => {
        snapshot.forEach((doc) => {
          console.log(doc.id, '=>', doc.data());
          // Handle the snapshot data here
        });
      },
      (error) => {
        console.error('Snapshot listener error:', error);
      }
    );
  }
}

// Function to handle logout
async function logout() {
  try {
    await signOut(auth);
    console.log('User logged out successfully.');
    if (unsubscribeSnapshotListener) {
      unsubscribeSnapshotListener();
      unsubscribeSnapshotListener = null;
      console.log('Snapshot listener unsubscribed.');
    }
    // Perform any necessary UI updates or redirects here.
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// Firebase Auth state change listener to detect login/logout
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.uid);

    // Example data to write to Firestore (could be replaced with actual user input)
    const exampleData = {
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com',
    };

    // Write data for the logged-in user to their document
    writeToFirestore(user.uid, exampleData); // Use user's UID for data write

    // Optionally, read data for the logged-in user
    readFromFirestore(user.uid); // Read the user's data from Firestore

    // Set up snapshot listener
    setupSnapshotListener(user.uid);
  } else {
    console.log('No user logged in');
    // If you have any UI updates to do when the user logs out, do them here.
  }
});

// Example: Attach the logout function to a button click
document.getElementById('logoutButton').addEventListener('click', logout);
