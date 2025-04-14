/**
 * Handles login and vault logic for CarrollFam Vault demo.
 * Client-side with PBKDF2 hashing, syncing via Netlify Functions.
 */

const HARDCODED_USERNAME = 'silientxroot';
const HARDCODED_PASSWORD_HASH = 'OhqJpAqf/Xonb74AwZEJKeQ/JlAQKGa/iQ9FKHpBPv8=';
const SALT = 'carrollfam-vault-demo-salt';
let encryptionKey = null;

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginForm = document.getElementById('login-form');
const loginBox = document.getElementById('login-box');
const vault = document.getElementById('vault');
let loginAttempts = 0;
const MAX_ATTEMPTS = 3;

// HTTPS check
if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
  loginError.textContent = 'This app requires HTTPS. Please use a secure connection.';
  loginForm.querySelector('button').disabled = true;
}

// Check if user is already logged in
if (localStorage.getItem('isLoggedIn') === 'true') {
  showVault();
  fetchVaultData();
}

async function deriveEncryptionKey(password) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(SALT + '-encryption'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptPassword(password, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(password)
  );
  return { iv: Array.from(iv), encrypted: Array.from(new Uint8Array(encrypted)) };
}

async function decryptPassword(encryptedData, key) {
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
      key,
      new Uint8Array(encryptedData.encrypted)
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
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
    console.log('Attempting login with username:', username); // Debug
    const hashedPassword = await hashPassword(password);
    console.log('Generated hash:', hashedPassword); // Debug
    console.log('Expected hash:', HARDCODED_PASSWORD_HASH); // Debug
    if (username !== HARDCODED_USERNAME || hashedPassword !== HARDCODED_PASSWORD_HASH) {
      loginAttempts++;
      loginError.textContent = 'Invalid username or password.';
      passwordInput.value = '';
      passwordInput.focus();
      loginForm.querySelector('button').disabled = false;
      return;
    }

    // Derive encryption key for vault passwords
    encryptionKey = await deriveEncryptionKey(password);

    loginAttempts = 0;
    localStorage.setItem('isLoggedIn', 'true');
    showVault();
    await fetchVaultData();
  } catch (error) {
    console.error('Login error:', error.message);
    loginError.textContent = error.message;
  } finally {
    loginForm.querySelector('button').disabled = false;
  }
}

async function syncVaultItems(vaultItems) {
  try {
    const encryptedItems = await Promise.all(
      vaultItems.map(async (item) => ({
        ...item,
        encryptedPassword: item.password ? await encryptPassword(item.password, encryptionKey) : null
      }))
    );
    const response = await fetch('/.netlify/functions/sync-vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: HARDCODED_USERNAME, items: encryptedItems })
    });
    if (!response.ok) throw new Error('Sync failed');
    return await response.json();
  } catch (error) {
    console.error('Sync error:', error.message);
    return null;
  }
}

async function fetchVaultData() {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    showLogin();
    return;
  }

  try {
    // Fetch from server
    const response = await fetch('/.netlify/functions/sync-vault?username=' + encodeURIComponent(HARDCODED_USERNAME));
    let serverItems = [];
    if (response.ok) {
      serverItems = (await response.json()).items || [];
      // Decrypt passwords
      serverItems = await Promise.all(
        serverItems.map(async (item) => ({
          ...item,
          password: item.encryptedPassword ? await decryptPassword(item.encryptedPassword, encryptionKey) : item.password
        }))
      );
    }

    // Get local items
    let localItems = JSON.parse(localStorage.getItem('vaultItems')) || [];

    // Merge (server takes precedence for conflicts)
    const mergedItems = [];
    const localMap = new Map(localItems.map((item) => [`${item.website}:${item.username}`, item]));
    for (const serverItem of serverItems) {
      const key = `${serverItem.website}:${serverItem.username}`;
      mergedItems.push(serverItem);
      localMap.delete(key);
    }
    mergedItems.push(...localMap.values());

    // Update local storage
    localStorage.setItem('vaultItems', JSON.stringify(mergedItems));

    // Display
    const vaultItemsDiv = document.getElementById('vault-items');
    vaultItemsDiv.innerHTML = mergedItems
      .map(
        (item, index) =>
          `<p><strong>Website:</strong> ${item.website}<br/><strong>Username:</strong> ${item.username}<br/><strong>Password:</strong> ${
            item.password || '[Hidden for security]'
          }<br/><strong>Note:</strong> ${item.note}<br/><button class="delete-button" onclick="deleteVaultItem(${index})">Delete</button></p><hr>`
      )
      .join('');
  } catch (error) {
    console.error('Error fetching vault data:', error.message);
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

    // Hash the vault password
    const hashedPassword = await hashPassword(password);

    // Update local storage
    let vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    vaultItems.push({ website, username, password, hashedPassword, note });
    localStorage.setItem('vaultItems', JSON.stringify(vaultItems));

    // Sync with server
    await syncVaultItems(vaultItems);

    // Refresh display
    await fetchVaultData();
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
    let vaultItems = JSON.parse(localStorage.getItem('vaultItems')) || [];
    if (index >= 0 && index < vaultItems.length) {
      vaultItems.splice(index, 1);
      localStorage.setItem('vaultItems', JSON.stringify(vaultItems));
      await syncVaultItems(vaultItems);
      await fetchVaultData();
    }
  } catch (error) {
    console.error('Error deleting vault item:', error.message);
    alert('Failed to delete item: ' + error.message);
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
  encryptionKey = null;
  usernameInput.focus();
}

function logout() {
  localStorage.setItem('isLoggedIn', 'false');
  showLogin();
}

usernameInput.focus();
