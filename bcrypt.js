const bcrypt = require('bcrypt');

// Salt rounds (number of times to hash the password)
const saltRounds = 12;

// Function to hash a password
async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hash);

    // Compare the password with the hash
    const isMatch = await bcrypt.compare(password, hash);
    console.log('Password match:', isMatch); // true or false
  } catch (err) {
    console.error('Error:', err);
  }
}

// Example usage
hashPassword('myPassword');
