const bcrypt = require('bcrypt');

async function generatePasswords() {
  const users = [
    { email: 'test@timecapsule.com', password: 'password123' },
    { email: 'sarah.jones@email.com', password: 'password123' },
    { email: 'mike.wilson@email.com', password: 'password123' },
    { email: 'emma.garcia@email.com', password: 'password123' },
    { email: 'alex.kim@email.com', password: 'password123' },
    { email: 'lisa.brown@email.com', password: 'password123' },
    { email: 'john.smith@email.com', password: 'password123' },
    { email: 'maria.lopez@email.com', password: 'password123' },
    { email: 'david.taylor@email.com', password: 'password123' },
    { email: 'jennifer.davis@email.com', password: 'password123' }
  ];

  console.log('-- Updated user passwords for seed data');
  console.log('-- All users have password: "password123"');
  console.log('');

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`UPDATE users SET password = '${hash}' WHERE id = ${i + 1}; -- ${user.email}`);
  }
}

generatePasswords().catch(console.error);
