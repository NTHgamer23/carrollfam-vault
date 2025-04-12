// Ensure bcrypt is loaded from a secure source
import bcrypt from 'bcrypt';

// Retrieve environment variables
const savedUsername = process.env.SAVED_USERNAME;
const savedPasswordHash = process.env.SAVED_PASSWORD_HASH;

// Event listener for the login button click
document.getElementById("login-btn").addEventListener("click", login);

async function login(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorField = document.getElementById("login-error");

    // Clear previous errors
    errorField.textContent = "";

    // Check if both username and password fields are filled
    if (!username || !password) {
        errorField.textContent = "Please fill in both username and password.";
        return;
    }

    // Check if the username matches
    if (username !== savedUsername) {
        errorField.textContent = "Invalid username.";
        return;
    }

    try {
        // Compare the entered password with the stored hash
        const match = await bcrypt.compare(password, savedPasswordHash);
        if (match) {
            // Hide login box and show the vault
            document.getElementById("login-box").style.display = "none";
            document.getElementById("vault").style.display = "block";
        } else {
            errorField.textContent = "Invalid password.";
        }
    } catch (err) {
        console.error("Error during password comparison:", err);
        errorField.textContent = "An unexpected error occurred.";
    }
}
