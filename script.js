// script.js
const storedUsername = "Carrollfam";
const storedPasswordHash = "$2a$10$KQQ5aW9SFEgcTTUQ7q0bWOFcL7tsYIUkTFyDP/JLTeKb9pOslHZ9i";

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("login-error");

    errorElement.innerText = "";

    if (!username || !password) {
        errorElement.innerText = "Please enter both username and password.";
        return;
    }

    if (username !== storedUsername) {
        errorElement.innerText = "Wrong username.";
        return;
    }

    try {
        const result = await bcrypt.compare(password, storedPasswordHash);
        if (result) {
            document.getElementById("login-box").style.display = "none";
            document.getElementById("vault").style.display = "block";
        } else {
            errorElement.innerText = "Wrong password.";
        }
    } catch (err) {
        console.error("bcrypt comparison error:", err);
        errorElement.innerText = "An unexpected error occurred.";
    }
}

document.getElementById("login-button").addEventListener("click", login);

document.getElementById("password").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login();
    }
});
