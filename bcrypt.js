const bcrypt = require('bcrypt');

// Salt rounds (number of times to hash the password)
const saltRounds = 10;

// Hash a password
bcrypt.hash('myPassword', saltRounds, function(err, hash) {
  if (err) throw err;

  // Store the hashed password (e.g., in a database)
  console.log('Hashed password:', hash);

  // Compare a password with a hash
  bcrypt.compare('myPassword', hash, function(err, result) {
    if (err) throw err;
    console.log('Password match:', result); // true or false
  });
});
