const { Handler } = require('@netlify/functions');
const sqlite3 = require('sqlite3').verbose();
const sanitizeHtml = require('sanitize-html');
const cookie = require('cookie');

let vaultDb;

const handler = async (event, context) => {
  // Initialize in-memory database
  if (!vaultDb) {
    vaultDb = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        console.error('Error opening vault database:', err.message);
      }
      vaultDb.run(
        `CREATE TABLE IF NOT EXISTS vault_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          website TEXT NOT NULL,
          username TEXT NOT NULL,
          password TEXT NOT NULL,
          note TEXT
        )`
      );
    });
  }

  // Check session
  const cookies = event.headers.cookie ? cookie.parse(event.headers.cookie) : {};
  const sessionId = cookies.sessionId;
  if (!sessionId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'Unauthorized' }),
    };
  }

  if (event.httpMethod === 'GET') {
    try {
      const sql = `SELECT website, username, password, note FROM vault_items`;
      const rows = await new Promise((resolve, reject) => {
        vaultDb.all(sql, [], (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, vaultItems: rows }),
      };
    } catch (error) {
      console.error('Vault data fetch error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'An unexpected error occurred.' }),
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      const { website, username, password, note } = JSON.parse(event.body);
      const sanitized = {
        website: sanitizeHtml(website),
        username: sanitizeHtml(username),
        password: sanitizeHtml(password),
        note: sanitizeHtml(note),
      };

      if (!sanitized.website || !sanitized.username || !sanitized.password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, message: 'Website, username, and password are required.' }),
        };
      }

      const sql = `INSERT INTO vault_items (website, username, password, note) VALUES (?, ?, ?, ?)`;
      await new Promise((resolve, reject) => {
        vaultDb.run(sql, [sanitized.website, sanitized.username, sanitized.password, sanitized.note], function (err) {
          if (err) reject(err);
          resolve();
        });
      });

      return {
        statusCode: 201,
        body: JSON.stringify({ success: true, message: 'Item added.' }),
      };
    } catch (error) {
      console.error('Vault data add error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, message: 'An unexpected error occurred.' }),
      };
    }
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' }),
    };
  }
};

exports.handler = handler;
