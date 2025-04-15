const SECRET_KEY = 'mysecretkey'; // Ensure this key is consistent

// Show the signup form
function showSignupForm() {
  document.getElementById('login-box').style.display = 'none';
  document.getElementById('signup-box').style.display = 'block';
  document.getElementById('login-error-container').style.display = 'none';
  document.getElementById('signup-error-container').style.display = 'none';
}

// Show the login form
function showLoginForm() {
  document.getElementById('signup-box').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
  document.getElementById('login-error-container').style.display = 'none';
  document.getElementById('signup-error-container').style.display = 'none';
}

// Handle user signup
function signup(event) {
  event.preventDefault();

  const username = document.getElementById('signup-username').value;
  const password = document.getElementById('signup-password').value;

  if (!username || !password) {
    document.getElementById('signup-error').textContent = 'Both fields are required!';
    return;
  }

  const encryptedPassword = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  localStorage.setItem(username, encryptedPassword);

  alert('Account created successfully!');
  showLoginForm();
}

// Handle user login
function login(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('login-error').textContent = 'Both fields are required!';
    return;
  }

  const encryptedPassword = localStorage.getItem(username);

  if (!encryptedPassword) {
    document.getElementById('login-error').textContent = 'User not found!';
    return;
  }

  const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY).toString(CryptoJS.enc.Utf8);

  if (decryptedPassword === password) {
    alert('Login successful!');
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('vault').style.display = 'block';
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials!';
  }
}

// Handle user logout
function logout() {
  document.getElementById('vault').style.display = 'none';
  document.getElementById('login-box').style.display = 'block';
}

