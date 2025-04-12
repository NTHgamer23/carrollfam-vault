import express from 'express';
import bcrypt from 'bcrypt';
import session from 'express-session';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

// Mock data for user validation (using hashed password)
const savedUsername = process.env.SAVED_USERNAME;
const savedPasswordHash = process.env.SAVED_PASSWORD_HASH;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        sameSite: 'Strict',
    }
}));

// Rate limiting to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: 'Too many login attempts, please try again later.',
});

app.use('/login', loginLimiter);

// Serve static files (e.g., index.html, style.css)
app.use(express.static('public'));

// Login route (validate user)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (username !== savedUsername) {
        return res.status(401).json({ error: 'Invalid username' });
    }

    try {
        const match = await bcrypt.compare(password, savedPasswordHash);
        if (match) {
            req.session.authenticated = true;
            return res.status(200).json({ message: 'Login successful' });
        } else {
            return res.status(401).json({ error: 'Invalid password' });
        }
    } catch (err) {
        console.error("Error during password comparison:", err);
        return res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// Protected vault route (requires authentication)
app.get('/vault', (req, res) => {
    if (req.session.authenticated) {
        res.status(200).json({
            message: 'Welcome to the vault',
            data: {
                Netflix: 'Carroll123',
                Hulu: 'Carroll456',
                Bank: 'CarrollBank789',
                Email: 'carrollfam@mail.com',
            }
        });
    } else {
        res.status(403).json({ error: 'Unauthorized access' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
