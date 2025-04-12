<script>
    // Mock data for user validation
    const savedUsername = "carrollfam";
    const savedPassword = "Carroll123"; // Plain text password

    // Event listener for the login button click
    document.getElementById("login-btn").addEventListener("click", login);

    function login() {
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

        // Check if the username and password match the saved values
        if (username !== savedUsername || password !== savedPassword) {
            errorField.textContent = "Invalid username or password.";
            return;
        }

        // Hide login box and show the vault
        document.getElementById("login-box").style.display = "none";
        document.getElementById("vault").style.display = "block";
    }
</script>
