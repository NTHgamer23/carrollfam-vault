// Store user credentials securely using CryptoJS
const SECRET_KEY = 'mysecretkey'; // Key for encryption (should be stored securely)
const storage = window.localStorage;

// Show Signup Form
function showSignupForm() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('signup-box').style.display = 'block';
  document.getElementById('login-error-container').style.display = 'none';
  document.getElementById('signup-error-container').style.display = 'none';
}

// Show Login Form
function showLoginForm() {
  document.getElementById('signup-box').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
  document.getElementById('login-error-container').style.display = 'none';
  document.getElementById('signup-error-container').style.display = 'none';
}

// Signup Functionality
function signup(event) {
  event.preventDefault();

  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  // Encrypt the password
  const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

  // Store the credentials in localStorage
  storage.setItem(username, encryptedPassword);

  alert('Account created successfully!');
  showLoginForm(); // Switch to Login form
}

// Login Functionality
function login(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Retrieve the encrypted password from localStorage
  const encryptedPassword = storage.getItem(username);

  if (!encryptedPassword) {
    document.getElementById('login-error').textContent = 'User not found!';
    return;
  }

  // Decrypt the stored password
  const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY).toString(CryptoJS.enc.Utf8);

  // Check if the password matches
  if (decryptedPassword === password) {
    alert('Login successful!');
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('vault').style.display = 'block';
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials!';
  }
}

// Logout Functionality
function logout() {
  document.getElementById('vault').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
}

// Add Vault Item Function (for future expansion)
function addVaultItem(event) {
  event.preventDefault();
  // Logic to add items to vault...
}
