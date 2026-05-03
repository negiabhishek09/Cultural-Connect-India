const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/abhishek/Desktop/Culture-Connect-India/Backend/.env' });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hashed = await bcrypt.hash('Admin123456', 12);
  const result = await mongoose.connection.collection('users').updateOne(
    { role: 'ADMIN' },
    { $set: { password: hashed } }
  );
  console.log('Updated:', result.modifiedCount, 'user');
  process.exit(0);
});
