/**
 * script.js
 * Handles login, signup, and vault logic for CarrollFam Vault demo.
 * Communicates with backend for authentication and vault data.
 */

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBox = document.getElementById('login-box');
const signupBox = document.getElementById('signup-box');
const vault = document.getElementById('vault');
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
const FETCH_TIMEOUT = 5000; // 5 seconds timeout

async function login(event) {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.success) {
      loginAttempts = 0;
      showVault();
      fetchVaultData();
    } else {
      loginAttempts++;
      loginError.textContent = data.message;
      passwordInput.value = '';
      passwordInput.focus();
    }
  } catch (error) {
    console.error('Login fetch error:', error.message);
    if (error.name === 'AbortError') {
      loginError.textContent = 'Request timed out. Please try again.';
    } else if (error.message.includes('Failed to fetch')) {
      loginError.textContent = 'Server unreachable. Check if the server is running.';
    } else {
      loginError.textContent = 'Network error. Try again later.';
    }
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
}

async function signup(event) {
  event.preventDefault();
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value;
  const signupError = document.getElementById('signup-error');
  signupError.textContent = '';
  const signupButton = document.getElementById('signup-form').querySelector('button');
  signupButton.disabled = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.success) {
      showLogin();
      loginError.textContent = 'Signup successful! Please log in.';
      document.getElementById('signup-form').reset();
    } else {
      signupError.textContent = data.message;
    }
  } catch (error) {
    console.error('Signup fetch error:', error.message);
    if (error.name === 'AbortError') {
      signupError.textContent = 'Request timed out. Please try again.';
    } else if (error.message.includes('Failed to fetch')) {
      signupError.textContent = 'Server unreachable. Check if the server is running.';
    } else {
      signupError.textContent = 'Network error. Try again later.';
    }
  } finally {
    signupButton.disabled = false;
  }
}

async function addVaultItem(event) {
  event.preventDefault();
  const website = document.getElementById('vault-website').value.trim();
  const username = document.getElementById('vault-username').value.trim();
  const note = document.getElementById('vault-note').value.trim();
  const vaultForm = document.getElementById('vault-form');
  vaultForm.querySelector('button').disabled = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch('/vault-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' Deprecation Warning: The `onabort` event is deprecated and will be removed in a future release. Please use the `abort` event instead.
      body: JSON.stringify({ website, username, note }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.success) {
      fetchVaultData();
      vaultForm.reset();
    }
  } catch (error) {
    console.error('Error adding vault item:', error);
  } finally {
    vaultForm.querySelector('button').disabled = false;
  }
}

async function fetchVaultData() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const response = await fetch('/vault-data', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    if (data.success) {
      const vaultItems = document.getElementById('vault-items');
      vaultItems.innerHTML = data.vaultItems
        .map(
          (item) =>
            `<p><strong>Website:</strong> ${item.website}<br/><strong>Username:</strong> ${item.username}<br/><strong>Note:</strong> ${item.note}</p><hr>`
        )
        .join('');
    }
  } catch (error) {
    console.error('Error fetching vault data:', error);
  }
}

function showVault() {
  loginBox.style.display = 'none';
  signupBox.style.display = 'none';
  vault.style.display = 'block';
}

function showLogin() {
  signupBox.style.display = 'none';
  vault.style.display = 'none';
  loginBox.style.display = 'block';
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.textContent = '';
  loginAttempts = 0;
  usernameInput.focus();
}

function showSignup() {
  loginBox.style.display = 'none';
  vault.style.display = 'none';
  signupBox.style.display = 'block';
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-error').textContent = '';
}

async function logout() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    await fetch('/logout', {
      method: 'POST',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    showLogin();
  } catch (error) {
    console.error('Logout error:', error);
    showLogin();
  }
}

usernameInput.focus();
