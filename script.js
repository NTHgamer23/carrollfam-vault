import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
    const userDocRef = doc(db, 'users', userId);  // Reference to the user's document
    try {
      await setDoc(userDocRef, data);  // Write data to Firestore
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
    const userDocRef = doc(db, 'users', userId);  // Reference to the user's document
    try {
      const docSnap = await getDoc(userDocRef);  // Get the document snapshot
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());  // Log the document data
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

// Firebase Auth state change listener to detect login/logout
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User logged in:', user.uid);
    
    // Example data to write to Firestore (could be replaced with actual user input)
    const exampleData = {
      name: 'John Doe',
      age: 25,
      email: 'john.doe@example.com'
    };
    
    // Write data for the logged-in user to their document
    writeToFirestore(user.uid, exampleData);  // Use user's UID for data write
    
    // Optionally, read data for the logged-in user
    readFromFirestore(user.uid);  // Read the user's data from Firestore
  } else {
    console.log('No user logged in');
  }
});
