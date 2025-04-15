// Import necessary Firebase modules
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Initialize Firebase Firestore and Authentication
const db = getFirestore();
const auth = getAuth();

// Function to check if the user is authenticated
function isAuthenticated() {
  return auth.currentUser != null;
}

// Write data to Firestore
async function writeToFirestore(userId, data) {
  if (isAuthenticated()) {
    const userDocRef = doc(db, 'users', userId);  // Reference to the user document
    try {
      await setDoc(userDocRef, data);  // Writing data to Firestore
      console.log('Document written!');
    } catch (error) {
      console.error('Error writing document:', error);
    }
  } else {
    console.error('User is not authenticated.');
  }
}

// Read data from Firestore
async function readFromFirestore(userId) {
  if (isAuthenticated()) {
    const userDocRef = doc(db, 'users', userId);  // Reference to the user document
    try {
      const docSnap = await getDoc(userDocRef);  // Reading the document from Firestore
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());  // Log the document data if it exists
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

// Update data in Firestore
async function updateFirestoreData(userId, data) {
  if (isAuthenticated()) {
    const userDocRef = doc(db, 'users', userId);  // Reference to the user document
    try {
      await updateDoc(userDocRef, data);  // Updating the document in Firestore
      console.log('Document updated!');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  } else {
    console.error('User is not authenticated.');
  }
}

// Firebase Auth state change listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.uid);
  } else {
    console.log('No user logged in');
  }
});

// Example usage:

// Example data to be written to Firestore
const exampleData = {
  name: 'John Doe',
  age: 25,
  email: 'john.doe@example.com'
};

// Example user ID (you would use the authenticated user's UID)
const userId = 'user123';  // This should come from the authenticated user

// Write to Firestore
writeToFirestore(userId, exampleData);

// Read from Firestore
readFromFirestore(userId);

// Update Firestore data
const updateData = { age: 26 };
updateFirestoreData(userId, updateData);

