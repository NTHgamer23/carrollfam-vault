import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  signOut,
  getAuth,
  onAuthStateChanged,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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
    const userDocRef = doc(db, 'users', userId);
    try {
      await setDoc(userDocRef, data);
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
    const userDocRef = doc(db, 'users', userId);
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        return docSnap.data(); // Return the data if needed.
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error reading document:', error);
      return null;
    }
  } else {
    console.error('User is not authenticated.');
    return null;
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
    console.log('Snapshot listener set up.');
  }
}

// Function to handle logout
async function logout() {
  try {
    await signOut(auth);
    console.log('User logged out successfully.');
    if (unsubscribeSnapshotListener) {
      console.log('Attempting to unsubscribe snapshot listener.');
      unsubscribeSnapshotListener();
      unsubscribeSnapshotListener = null;
      console.log('Snapshot listener unsubscribed.');
    } else {
      console.log('No snapshot listener to unsubscribe.');
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
    writeToFirestore(user.uid, exampleData);

    // Optionally, read data for the logged-in user
    readFromFirestore(user.uid);

    // Set up snapshot listener
    setupSnapshotListener(user.uid);
  } else {
    console.log('No user logged in. currentUser:', auth.currentUser);
    // If you have any UI updates to do when the user logs out, do them here.
  }
});

// Example: Attach the logout function to a button click
document.getElementById('logoutButton').addEventListener('click', logout);
