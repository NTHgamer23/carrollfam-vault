const { Handler } = require('@netlify/functions');
const cookie = require('cookie');

const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ success: false, message: 'Method Not Allowed' }) };
  }

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookie.serialize('sessionId', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0), // Expire immediately
      }),
    },
    body: JSON.stringify({ success: true, message: 'Logged out.' }),
  };
};

exports.handler = handler;
