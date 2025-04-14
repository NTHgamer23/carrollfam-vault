/**
 * Handles login and vault logic for CarrollFam Vault demo.
 * All logic is client-side using localStorage with PBKDF2 hashing.
 */

const HARDCODED_USERNAME = 'silientxroot';
const HARDCODED_PASSWORD_HASH = 'OhqJpAqf/Xonb74AwZEJKeQ/JlAQKGa/iQ9FKHpBPv8=';
const SALT = 'carrollfam-vault-demo-salt';
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBox = document.getElementById('login-box');
const vault = document.getElementById('vault');
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let lockoutUntil = 0;

// Session timeout handling
let sessionTimer;
function resetSessionTimer() {
  clearTimeout(sessionTimer);
  sessionTimer = setTimeout(() => {
    logout();
    alert('Session timed out due to inactivity.');
  }, SESSION_TIMEOUT);
}

// Check if user is already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
  showVault();
  fetchVaultData();
  resetSessionTimer();
}

// HTTPS check
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  alert('This app requires HTTPS for security. Redirecting...');
  window.location.protocol = 'https:';
}

async function hashPassword(password, iterations = 1000000) {
  try {
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(SALT),
        iterations,
        hash: 'SHA-256'
      },
      await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      ),
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );
    const hashBytes = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(hashBytes)));
  } catch (error) {
    throw new Error('Hashing failed: ' + error.message);
  }
}

async function login(event) {
  event.preventDefault();

  const now = Date.now();
  if (lockoutUntil > now) {
    const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
    loginError.textContent = `Too many attempts. Try again in ${secondsLeft} seconds.`;
    return;
  }

  if (loginAttempts >= MAX_ATTEMPTS) {
    lockoutUntil = now + 30 * 1000; // 30-second lockout
    loginError.textContent = 'Too many attempts. Try again in 30 seconds.';
    setTimeout(() => {
      loginAttempts = 0;
      lockoutUntil = 0;
      loginError.textContent = '';
      loginForm.querySelector('button').disabled = false;
    }, 30 * 1000);
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  loginError.textContent = '';
  loginForm.querySelector('button').disabled = true;

  try {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not supported. Use a secure browser.');
    }
    const hashedPassword = await hashPassword(password, 1000000);
    if (username !== HARDCODED_USERNAME || hashedPassword !== HARDCODED_PASSWORD_HASH) {
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
    resetSessionTimer();
    document.addEventListener('mousemove', resetSessionTimer);
    document.addEventListener('keydown', resetSessionTimer);
  } catch (error) {
    console.error('Login error:', error.message);
    loginError.textContent = error.message;
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
}

async function addVaultItem(event) {
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

    // Hash the vault password with fewer iterations for speed
    const hashedPassword = await hashPassword(password, 100000);

    // Store both plain and hashed password
    let vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    vaultItems.push({ website, username, password, hashedPassword, note });
    localStorage.setItem('vaultItems', JSON.stringify(vaultItems));

    fetchVaultData();
    vaultForm.reset();
  } catch (error) {
    console.error('Error adding vault item:', error.message);
    alert('Failed to add item: ' + error.message);
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
          `<p><strong>Website:</strong> ${item.website}<br/><strong>Username:</strong> ${item.username}<br/><strong>Password:</strong> ${item.password}<br/><strong>Note:</strong> ${item.note}</p><hr>`
      )
      .join('');
  } catch (error) {
    console.error('Error fetching vault data:', error.message);
  }
}

function showVault() {
  loginBox.style.display = 'none';
  vault.style.display = 'block';
  resetSessionTimer();
}

function showLogin() {
  vault.style.display = 'none';
  loginBox.style.display = 'block';
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
  loginAttempts = 0;
  lockoutUntil = 0;
  usernameInput.focus();
  clearTimeout(sessionTimer);
  document.removeEventListener('mousemove', resetSessionTimer);
  document.removeEventListener('keydown', resetSessionTimer);
}

function logout() {
  localStorage.setItem('isLoggedIn', 'false');
  showLogin();
}

usernameInput.focus();
