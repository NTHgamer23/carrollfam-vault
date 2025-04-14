const fs = require('fs').promises;
const path = require('path');

exports.handler = async function (event, context) {
  const dataFile = path.join(__dirname, 'vault-data.json');
  
  try {
    // Initialize file if it doesn't exist
    let vaultData = {};
    try {
      vaultData = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    if (event.httpMethod === 'GET') {
      const username = event.queryStringParameters.username;
      return {
        statusCode: 200,
        body: JSON.stringify({ items: vaultData[username] || [] })
      };
    }

    if (event.httpMethod === 'POST') {
      const { username, items } = JSON.parse(event.body);
      vaultData[username] = items;
      await fs.writeFile(dataFile, JSON.stringify(vaultData, null, 2));
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error) {
    console.error('Server error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};