/**
 * server.js
 * Node.js/Express server for CarrollFam Vault demo.
 * Handles signup, login, vault data, and sessions.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const sanitizeHtml = require('sanitize-html');

const app = express();
const port = process.env.PORT || 3000;
const saltRounds = 10;

const db = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )`
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS vault_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        website TEXT NOT NULL,
        username TEXT NOT NULL,
        note TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`
    );
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

app.use(
  ['/login', '/signup'],
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { success: false, message: 'Too many attempts. Try again later.' },
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

app.post('/signup', async (req, res) => {
  const username = sanitizeHtml(req.body.username);
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const sql = `INSERT INTO users (username, password_hash) VALUES (?, ?)`;
    db.run(sql, [username, passwordHash], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ success: false, message: 'Username already taken.' });
        }
        console.error('Database error during signup:', err.message);
        return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
      }
      console.log(`User created: ${username}`);
      res.status(201).json({ success: true, message: 'Signup successful!' });
    });
  } catch (error) {
    console.error('Signup error:', error.stack);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

app.post('/login', async (req, res) => {
  const username = sanitizeHtml(req.body.username);
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const sql = `SELECT * FROM users WHERE username = ?`;
    db.get(sql, [username], async (err, user) => {
      if (err) {
        console.error('Database error during login:', err.message);
        return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
      }
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password.' });
      }
      try {
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
          req.session.user = { id: user.id, username };
          res.status(200).json({ success: true, message: 'Login successful!' });
        } else {
          res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
      } catch (error) {
        console.error('Login error:', error.stack);
        res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
      }
    });
  } catch (error) {
    console.error('Login error:', error.stack);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.stack);
      return res.status(500).json({ success: false, message: 'Logout failed.' });
    }
    res.status(200).json({ success: true, message: 'Logged out.' });
  });
});

app.get('/vault-data', isAuthenticated, async (req, res) => {
  try {
    const sql = `SELECT website, username, note FROM vault_items WHERE user_id = ?`;
    db.all(sql, [req.session.user.id], (err, rows) => {
      if (err) {
        console.error('Database error fetching vault data:', err.message);
        return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
      }
      res.status(200).json({ success: true, vaultItems: rows });
    });
  } catch (error) {
    console.error('Vault data error:', error.stack);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

app.post('/vault-data', isAuthenticated, async (req, res) => {
  const { website, username, note } = req.body;
  const sanitized = {
    website: sanitizeHtml(website),
    username: sanitizeHtml(username),
    note: sanitizeHtml(note),
  };

  if (!sanitized.website || !sanitized.username) {
    return res.status(400).json({ success: false, message: 'Website and username are required.' });
  }

  try {
    const sql = `INSERT INTO vault_items (user_id, website, username, note) VALUES (?, ?, ?, ?)`;
    db.run(sql, [req.session.user.id, sanitized.website, sanitized.username, sanitized.note], function (err) {
      if (err) {
        console.error('Database error adding vault item:', err.message);
        return res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
      }
      res.status(201).json({ success: true, message: 'Item added.' });
    });
  } catch (error) {
    console.error('Vault item error:', error.stack);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err.message);
    console.log('Closed database connection.');
    process.exit(0);
  });
});
