// script.js

const storedUsername = "Carrollfam";
const storedPassword = "Carrollfam123"; // Plain text password

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("login-error");

    errorElement.innerText = "";

    // Check if both fields are entered
    if (!username || !password) {
        errorElement.innerText = "Please enter both username and password.";
        return;
    }

    // Check if the username matches
    if (username !== storedUsername) {
        errorElement.innerText = "Wrong username.";
        return;
    }

    // Compare the entered password with the stored password (in plain text)
    if (password === storedPassword) {
        // Hide login box and show vault
        document.getElementById("login-box").style.display = "none";
        document.getElementById("vault").style.display = "block";
    } else {
        errorElement.innerText = "Wrong password.";
    }
}

// Attach the login function to the login button
document.getElementById("login-button").addEventListener("click", login);

// Allow pressing Enter to trigger the login function
document.getElementById("password").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login();
    }
});
