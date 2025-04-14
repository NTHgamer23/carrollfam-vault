/**
 * server.js
 * Basic Node.js/Express server for Carroll Vault Demo
 * Handles signup, login, serves static files, and demonstrates bcrypt hashing.
 *
 * WARNING: This is a simplified example for educational purposes.
 * Production applications require more robust security, error handling,
 * session management, and potentially a different database setup.
 */

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose(); // Use verbose for more detailed logs

const app = express();
const port = 3000; // Port the server will listen on

const saltRounds = 10; // Cost factor for bcrypt hashing

// --- Database Setup ---
// Creates or opens the users.db file in the same directory
const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("Users table ready.");
            }
        });
    }
});

// --- Middleware ---
// To parse JSON request bodies (for signup/login)
app.use(express.json());
// To parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, client-side JS)
// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Serve other static files like CSS and JS
app.use(express.static(__dirname)); // Serves files from the current directory

// --- API Routes ---

// SIGNUP Route (POST)
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    if (password.length < 6) { // Example: enforce minimum password length
         return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }


    try {
        // Hash the password using bcrypt
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Store username and hashed password in the database
        const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
        db.run(sql, [username, passwordHash], function(err) { // Use function() to access this.lastID
            if (err) {
                // Check for unique constraint violation (username already exists)
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.error('Signup error: Username already exists -', username);
                    return res.status(409).json({ success: false, message: 'Username already taken.' }); // 409 Conflict
                }
                console.error('Database error during signup:', err.message);
                return res.status(500).json({ success: false, message: 'Database error during signup.' });
            }
            console.log(`User created with ID: ${this.lastID}, Username: ${username}`);
            // Send success response (don't send hash back)
            res.status(201).json({ success: true, message: 'Signup successful!' }); // 201 Created
        });

    } catch (error) {
        console.error('Error during signup hashing:', error);
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
});

// LOGIN Route (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => { // Use db.get for single row
        if (err) {
            console.error('Database error during login:', err.message);
            return res.status(500).json({ success: false, message: 'Database error during login.' });
        }

        if (!user) {
            // User not found
            console.log('Login attempt failed: User not found -', username);
            return res.status(401).json({ success: false, message: 'Invalid username or password.' }); // 401 Unauthorized
        }

        try {
            // User found, compare password with stored hash
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // Passwords match! Login successful.
                console.log('Login successful for user:', username);
                // In a real app, you'd create a session or JWT here.
                // For this demo, just send success.
                res.status(200).json({ success: true, message: 'Login successful!' });
            } else {
                // Passwords don't match
                console.log('Login attempt failed: Incorrect password for user -', username);
                res.status(401).json({ success: false, message: 'Invalid username or password.' }); // 401 Unauthorized
            }
        } catch (error) {
            console.error('Error during login password comparison:', error);
            res.status(500).json({ success: false, message: 'Server error during login.' });
        }
    });
});


// --- Simple Protected Vault Data Route (GET) ---
// In a real app, this route would be protected by session/token middleware
// to ensure the user is actually logged in.
// For this demo, we just return dummy data if requested.
app.get('/vault-data', (req, res) => {
    // TODO: Add actual authentication check here in a real app!
    console.log("Serving vault data (demo - no auth check)");
    res.status(200).json({
        success: true,
        vaultItems: [
            { website: "Demo Site Alpha", username: "user_alpha", note: "Fetched from server" },
            { website: "Demo Service Beta", username: "user_beta", note: "Requires real auth" },
            { website: "Reminder", username: "System", note: "Protect this endpoint properly!" }
        ]
    });
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// --- Graceful Shutdown ---
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});
