const storedUsername = "Carrollfam";
const storedPasswordHash = "$2a$10$KQQ5aW9SFEgcTTUQ7q0bWOFcL7tsYIUkTFyDP/JLTeKb9pOslHZ9i"; // Hash for "Carrollfam"

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (username !== storedUsername) {
    showError("Wrong username.");
    return;
  }

  bcrypt.compare(password, storedPasswordHash, function (err, result) {
    if (result) {
      document.getElementById("login-box").style.display = "none";
      document.getElementById("vault").style.display = "block";
    } else {
      showError("Wrong password.");
    }
  });
}

function showError(msg) {
  document.getElementById("login-error").innerText = msg;
}
