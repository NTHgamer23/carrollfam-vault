/**
 * Handles login and vault logic for CarrollFam Vault demo.
 * All logic is client-side using localStorage.
 */

const HARDCODED_USERNAME = 'silientxroot';
const HARDCODED_PASSWORD_HASH = '$2a$12$8Z7Qz7k5X9Y9Z6W8V3T2O.Q3hJ2k9L5N7P8M4R0T1U6V9W2X3Y4Z5';

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBox = document.getElementById('login-box');
const vault = document.getElementById('vault');
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;

// Check if user is already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
  showVault();
  fetchVaultData();
}

function login(event) {
  event.preventDefault();

  if (loginAttempts >= MAX_ATTEMPTS) {
    loginError.textContent = 'Too many attempts. Try again later.';
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  loginError.textContent = '';
  loginForm.querySelector('button').disabled = true;

  try {
    if (username !== HARDCODED_USERNAME || !bcrypt.compareSync(password, HARDCODED_PASSWORD_HASH)) {
      loginAttempts++;
      loginError.textContent = 'Invalid username or password.';
      passwordInput.value = '';
      passwordInput.focus();
      loginForm.querySelector('button').disabled = false;
      return;
    }

    loginAttempts = 0;
    localStorage.setItem('isLoggedIn', 'true');
    showVault();
    fetchVaultData();
  } catch (error) {
    console.error('Login error:', error.message);
    loginError.textContent = 'An unexpected error occurred.';
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
}

function addVaultItem(event) {
  event.preventDefault();

  if (localStorage.getItem('isLoggedIn') !== 'true') {
    showLogin();
    return;
  }

  const website = document.getElementById('vault-website').value.trim();
  const username = document.getElementById('vault-username').value.trim();
  const password = document.getElementById('vault-password').value.trim();
  const note = document.getElementById('vault-note').value.trim();
  const vaultForm = document.getElementById('vault-form');
  vaultForm.querySelector('button').disabled = true;

  try {
    if (!website || !username || !password) {
      alert('Website, username, and password are required.');
      return;
    }

    // Hash the vault password with 10 salt rounds
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Get existing vault items or initialize an empty array
    let vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    vaultItems.push({ website, username, password: hashedPassword, note });
    localStorage.setItem('vaultItems', JSON.stringify(vaultItems));

    fetchVaultData();
    vaultForm.reset();
  } catch (error) {
    console.error('Error adding vault item:', error.message);
  } finally {
    vaultForm.querySelector('button').disabled = false;
  }
}

function fetchVaultData() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    showLogin();
    return;
  }

  try {
    const vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    const vaultItemsDiv = document.getElementById('vault-items');
    vaultItemsDiv.innerHTML = vaultItems
      .map(
        (item) =>
          `<p><strong>Website:</strong> ${item.website}<br/><strong>Username:</strong> ${item.username}<br/><strong>Password:</strong> [Hidden for security]<br/><strong>Note:</strong> ${item.note}</p><hr>`
      )
      .join('');
  } catch (error) {
    console.error('Error fetching vault data:', error.message);
  }
}

function showVault() {
  loginBox.style.display = 'none';
  vault.style.display = 'block';
}

function showLogin() {
  vault.style.display = 'none';
  loginBox.style.display = 'block';
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
  loginAttempts = 0;
  usernameInput.focus();
}

function logout() {
  localStorage.setItem('isLoggedIn', 'false');
  showLogin();
}

usernameInput.focus();