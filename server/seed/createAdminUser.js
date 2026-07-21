// One-time helper to bootstrap the very first Admin account.
// Only an Admin can normally assign the "admin" or "vendor" role, so this
// script exists to break that chicken-and-egg problem.
//
// Usage:
//   1. Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in your .env file
//   2. Run: npm run seed:admin

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/userModel');

const createAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'shindesiddhis@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const name = process.env.ADMIN_NAME || 'Super Admin';

  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Existing user promoted to admin: ${email}`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`Admin user created successfully.`);
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

createAdmin().catch((err) => {
  console.error('Failed to create admin user:', err.message);
  process.exit(1);
});
