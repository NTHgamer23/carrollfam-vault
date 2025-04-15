const loginForm = document.getElementById("login-form");
const vaultForm = document.getElementById("vault-form");
const loginBox = document.getElementById("login-box");
const vault = document.getElementById("vault");
const loginError = document.getElementById("login-error");
const vaultItems = document.getElementById("vault-items");

let currentUser = null;
const validUsername = "demo";
const validPassword = "password";
const secretKey = "supersecretkey123"; // change this

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[decryption error]";
  }
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username === validUsername && password === validPassword) {
    currentUser = username;
    loginBox.style.display = "none";
    vault.style.display = "block";
    loadVaultItems();
  } else {
    loginError.textContent = "Invalid credentials.";
  }
}

function logout() {
  currentUser = null;
  loginBox.style.display = "block";
  vault.style.display = "none";
  loginForm.reset();
  vaultItems.innerHTML = "";
}

function addVaultItem(event) {
  event.preventDefault();
  const website = document.getElementById("vault-website").value.trim();
  const username = document.getElementById("vault-username").value.trim();
  const password = encrypt(document.getElementById("vault-password").value);
  const note = encrypt(document.getElementById("vault-note").value.trim());

  if (!website || !username || !password) return;

  const item = { website, username, password, note };
  const items = JSON.parse(localStorage.getItem(`vault-${currentUser}`)) || [];
  items.push(item);
  localStorage.setItem(`vault-${currentUser}`, JSON.stringify(items));

  vaultForm.reset();
  loadVaultItems();
}

function loadVaultItems() {
  vaultItems.innerHTML = "";
  const items = JSON.parse(localStorage.getItem(`vault-${currentUser}`)) || [];

  items.forEach((item, index) => {
    const p = document.createElement("p");
    p.innerHTML = `
      <strong>Website:</strong> ${item.website}<br>
      <strong>Username:</strong> ${item.username}<br>
      <strong>Password:</strong> ${decrypt(item.password)}<br>
      ${item.note ? `<strong>Note:</strong> ${decrypt(item.note)}<br>` : ""}
      <button class="delete-button" onclick="deleteVaultItem(${index})">Delete</button>
    `;
    vaultItems.appendChild(p);
    vaultItems.appendChild(document.createElement("hr"));
  });
}

function deleteVaultItem(index) {
  const items = JSON.parse(localStorage.getItem(`vault-${currentUser}`)) || [];
  items.splice(index, 1);
  localStorage.setItem(`vault-${currentUser}`, JSON.stringify(items));
  loadVaultItems();
}
