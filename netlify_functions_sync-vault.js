let vaultData = {};

exports.handler = async function (event, context) {
  try {
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
