import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import dotenv from 'dotenv';

// ✅ FIX: Exact path se .env load karo
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const resetPassword = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.log('❌ MONGO_URI nahi mila .env mein');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DB')));
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✅ DB connected');

  const email = 'ajaynegi910@gmail.com';    
  const newPassword = 'negi0911'; 

  const hashed = await bcrypt.hash(newPassword, 12);

  const result = await mongoose.connection
    .collection('users')
    .updateOne(
      { email: email.toLowerCase() },
      { $set: { password: hashed } }
    );

  if (result.modifiedCount > 0) {
    console.log(`✅ The password has been reset.: ${email}`);
  } else {
    console.log(`❌ User not found.: ${email}`);
  }

  await mongoose.disconnect();
  console.log('✅ Done!');
};

resetPassword();