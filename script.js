const storedUsername = "Carrollfam";
const storedPasswordHash = "$2a$10$KQQ5aW9SFEgcTTUQ7q0bWOFcL7tsYIUkTFyDP/JLTeKb9pOslHZ9i"; // Hash for "Carrollfam"

async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorElement = document.getElementById("login-error");

    // Clear any previous error messages
    errorElement.innerText = "";

    if (!username || !password) {
        showError("Please enter both username and password.");
        return;
    }

    if (username !== storedUsername) {
        showError("Wrong username.");
        return;
    }

    try {
        const result = await bcrypt.compare(password, storedPasswordHash);
        if (result) {
            document.getElementById("login-box").style.display = "none";
            document.getElementById("vault").style.display = "block";
        } else {
            showError("Wrong password.");
        }
    } catch (err) {
        console.error("bcrypt comparison error:", err);
        showError("An unexpected error occurred."); // Generic error for security
    }
}

function showError(msg) {
    document.getElementById("login-error").innerText = msg;
}

// Event listener for the login button
document.getElementById("login-button").addEventListener("click", login);

// Add an event listener for the 'Enter' key press in the password field
document.getElementById("password").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        login();
    }
});

//Enhanced HTML example;
//<div id="login-box">
//    <h2>Login</h2>
//    <input type="text" id="username" placeholder="Username">
//    <input type="password" id="password" placeholder="Password">
//    <button id='login-button'>Login</button>
//    <p id="login-error" style="color: red;"></p>
//</div>
