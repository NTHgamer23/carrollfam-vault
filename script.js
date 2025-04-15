/**
 * Handles login and vault logic for CarrollFam Vault demo.
 * In-memory storage, manual sync via code exchange, no localStorage.
 */

const HARDCODED_USERNAME = 'silientxroot';
const HARDCODED_PASSWORD_HASH = 'OhqJpAqf/Xonb74AwZEJKeQ/JlAQKGa/iQ9FKHpBPv8=';
const SALT = 'carrollfam-vault-demo-salt';

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBox = document.getElementById('login-box');
const vault = document.getElementById('vault');
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;
let vaultItems = [];
let isLoggedIn = false;

// HTTPS check
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  loginError.textContent = 'This app requires HTTPS. Please use a secure connection.';
  loginForm.querySelector('button').disabled = true;
}

async function hashPassword(password) {
  try {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const saltBytes = encoder.encode(SALT);
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: 100000,
        hash: 'SHA-256'
      },
      await crypto.subtle.importKey(
        'raw',
        passwordBytes,
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

  if (loginAttempts >= MAX_ATTEMPTS) {
    loginError.textContent = 'Too many attempts. Try again later.';
    return;
  }

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  loginError.textContent = '';
  loginForm.querySelector('button').disabled = true;

  try {
    if (!crypto.subtle) {
      throw new Error('Web Crypto API not supported. Use a secure browser.');
    }
    console.log('Attempting login with username:', username);
    const hashedPassword = await hashPassword(password);
    console.log('Generated hash:', hashedPassword);
    console.log('Expected hash:', HARDCODED_PASSWORD_HASH);
    if (username !== HARDCODED_USERNAME || hashedPassword !== HARDCODED_PASSWORD_HASH) {
      loginAttempts++;
      loginError.textContent = 'Invalid username or password.';
      passwordInput.value = '';
      passwordInput.focus();
      loginForm.querySelector('button').disabled = false;
      return;
    }

    loginAttempts = 0;
    isLoggedIn = true;
    showVault();
    renderVaultItems();
  } catch (error) {
    console.error('Login error:', error.message);
    loginError.textContent = `Login failed: ${error.message}`;
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
}

async function addVaultItem(event) {
  event.preventDefault();

  if (!isLoggedIn) {
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

    // Hash the vault password
    const hashedPassword = await hashPassword(password);

    // Add to in-memory array
    vaultItems.push({ website, username, password, hashedPassword, note, timestamp: Date.now() });

    // Refresh display
    renderVaultItems();
    vaultForm.reset();
  } catch (error) {
    console.error('Error adding vault item:', error.message);
    alert('Failed to add item: ' + error.message);
  } finally {
    vaultForm.querySelector('button').disabled = false;
  }
}

async function deleteVaultItem(index) {
  try {
    if (index >= 0 && index < vaultItems.length) {
      vaultItems.splice(index, 1);
      renderVaultItems();
    }
  } catch (error) {
    console.error('Error deleting vault item:', error.message);
    alert('Failed to delete item: ' + error.message);
  }
}

function exportVault() {
  try {
    const data = JSON.stringify(vaultItems);
    const syncCode = btoa(data);
    prompt('Copy this sync code:', syncCode);
  } catch (error) {
    alert('Failed to export vault: ' + error.message);
  }
}

function importVault() {
  const syncCode = document.getElementById('import-code').value.trim();
  if (!syncCode) {
    alert('Please paste a sync code.');
    return;
  }

  try {
    const data = atob(syncCode);
    const incomingItems = JSON.parse(data);

    // Merge items (newest timestamp wins)
    const merged = [];
    const allItems = [...vaultItems, ...incomingItems];
    const seen = new Set();

    for (const item of allItems) {
      const key = `${item.website}:${item.username}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      } else {
        const existing = merged.find((m) => `${m.website}:${m.username}` === key);
        if (existing.timestamp < item.timestamp) {
          Object.assign(existing, item);
        }
      }
    }

    vaultItems = merged;
    renderVaultItems();
    document.getElementById('import-code').value = '';
  } catch (error) {
    alert('Invalid sync code: ' + error.message);
  }
}

function renderVaultItems() {
  const vaultItemsDiv = document.getElementById('vault-items');
  vaultItemsDiv.innerHTML = vaultItems
    .map(
      (item, index) =>
        `<p><strong>Website:</strong> ${item.website}<br/><strong>Username:</strong> ${item.username}<br/><strong>Password:</strong> ${
          item.password || '[Hidden for security]'
        }<br/><strong>Note:</strong> ${item.note}<br/><button class="delete-button" onclick="deleteVaultItem(${index})">Delete</button></p><hr>`
    )
    .join('');
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
  isLoggedIn = false;
  vaultItems = [];
  showLogin();
}

usernameInput.focus();
