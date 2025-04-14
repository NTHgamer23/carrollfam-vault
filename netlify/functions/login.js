const { Handler } = require('@netlify/functions');
const cookie = require('cookie');

const HARDCODED_USERNAME = 'silientxroot';
const HARDCODED_PASSWORD = 'Jn6119_270100663!#';

const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Username and password are required.' }),
      };
    }

    if (username !== HARDCODED_USERNAME || password !== HARDCODED_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Invalid username or password.' }),
      };
    }

    // Set session cookie
    const sessionId = `sess_${Date.now()}`;
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': cookie.serialize('sessionId', sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 3600, // 1 hour
        }),
      },
      body: JSON.stringify({ success: true, message: 'Login successful!' }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'An unexpected error occurred.' }),
    };
  }
};

exports.handler = handler;
