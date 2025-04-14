/**
 * script.js
 * Handles the DEMO login logic for index.html (Improved Version)
 *
 * WARNING: This script uses hardcoded credentials for demonstration ONLY.
 * It is NOT secure and should NEVER be used for real applications
 * or with real passwords. Secure authentication requires server-side code.
 */

// --- DOM Elements ---
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error'); // The <p> tag for the message
const loginBox = document.getElementById('login-box');
const vault = document.getElementById('vault');
const loginForm = document.getElementById('login-form'); // Get the form element

// --- Dummy Credentials (FOR DEMO PURPOSES ONLY) ---
// In a real application, these would NOT be stored in client-side code.
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'password'; // Super insecure! Just for the demo flow.

/**
 * Handles the login attempt when the form is submitted.
 * @param {Event} event - The form submission event.
 */
function login(event) {
  // Prevent the default form submission behavior which reloads the page
  if (event) {
      event.preventDefault();
  }

  // Get the values entered by the user
  const enteredUsername = usernameInput.value.trim();
  const enteredPassword = passwordInput.value; // Don't trim password

  // Clear any previous error messages
  loginError.textContent = '';

  // --- Basic Client-Side Validation ---
  if (enteredUsername === '') {
      loginError.textContent = 'Please enter your username.';
      usernameInput.focus(); // Focus the username field
      return; // Stop the function here
  }
  if (enteredPassword === '') {
      loginError.textContent = 'Please enter your password.';
      passwordInput.focus(); // Focus the password field
      return; // Stop the function here
  }

  // --- DEMO Credential Check Logic ---
  // Compare entered credentials with the hardcoded dummy credentials.
  if (enteredUsername === DEMO_USERNAME && enteredPassword === DEMO_PASSWORD) {
    // If credentials match (for this demo):
    console.log('Demo login successful');
    showVault(); // Show the vault section
  } else {
    // If credentials do not match:
    console.log('Demo login failed');
    loginError.textContent = 'Invalid username or password.'; // Show error message
    // Optionally clear the password field after a failed attempt
    passwordInput.value = '';
    passwordInput.focus();
  }
}

/**
 * Shows the vault section and hides the login box.
 */
function showVault() {
  loginBox.style.display = 'none'; // Hide the login form
  vault.style.display = 'block'; // Show the vault content
}

/**
 * Hides the vault section and shows the login box.
 * Also clears fields and errors.
 */
function hideVault() {
    vault.style.display = 'none'; // Hide the vault content
    loginBox.style.display = 'block'; // Show the login form

    // Clear input fields for security/convenience
    usernameInput.value = '';
    passwordInput.value = '';
    loginError.textContent = ''; // Clear any lingering error messages

    // Optionally focus the username field when logging out
    usernameInput.focus();
}

/**
 * Handles the logout action.
 */
function logout() {
    console.log('Demo logout');
    hideVault(); // Hide vault, show login, clear fields
}

// --- Event Listeners ---
// We now use the form's 'submit' event instead of inline onclick for the button
// This is generally better practice. The login function is called via onsubmit="login(event)" in the HTML form tag.

// Note: The 'keypress' listeners for Enter key are no longer strictly necessary
// because pressing Enter inside a form field typically triggers the form's submit event naturally.
// However, keeping them can sometimes provide slightly more responsive UX or handle edge cases.
// If keeping them, ensure they call login(null) or similar if the event object isn't needed there.
// For simplicity, they are removed here as the form submit handles the Enter key.

// --- Initial Setup ---
// Give initial focus to the username field when the page loads
usernameInput.focus();
