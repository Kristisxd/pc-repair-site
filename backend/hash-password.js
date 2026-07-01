// Usage: node hash-password.js "yourRealPassword"
// Copy the printed hash into ADMIN_PASSWORD_HASH in your .env file.

const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password) {
  console.error('Usage: node hash-password.js "yourPassword"');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log('\nPut this in your .env as ADMIN_PASSWORD_HASH:\n');
  console.log(hash);
  console.log('');
});
