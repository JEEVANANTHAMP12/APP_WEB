/**
 * Seed script — creates the login accounts.
 * Run: node seed.js
 *
 * Login credentials
 * ─────────────────────────────────────────
 * Admin    →  admin@demo.com      / demo123
 * Owner    →  thomas@gmail.com    / demo123
 * Staff    →  john@gmail.com      / demo123
 * Student  →  kamalesh@gmail.com  / demo123
 * ─────────────────────────────────────────
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/unicanteen';

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  university_id: { type: mongoose.Schema.Types.ObjectId, ref: 'University', default: null },
  canteen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', default: null },
  wallet_balance: { type: Number, default: 0 },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  is_approved: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Remove existing users only
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    const hash = await bcrypt.hash('demo123', 12);

    await User.create([
      { name: 'Admin',    email: 'admin@demo.com',     password: hash, role: 'admin',   phone: '9000000001' },
      { name: 'Thomas',   email: 'thomas@gmail.com',   password: hash, role: 'owner',   phone: '9000000002', is_approved: true },
      { name: 'John',     email: 'john@gmail.com',     password: hash, role: 'staff',   phone: '9000000003' },
      { name: 'Kamalesh', email: 'kamalesh@gmail.com', password: hash, role: 'student', phone: '9000000004', wallet_balance: 500 },
    ]);

    console.log('\n✅ Login accounts created:');
    console.log('─────────────────────────────────────────');
    console.log('  Admin    →  admin@demo.com      / demo123');
    console.log('  Owner    →  thomas@gmail.com    / demo123');
    console.log('  Staff    →  john@gmail.com      / demo123');
    console.log('  Student  →  kamalesh@gmail.com  / demo123');
    console.log('─────────────────────────────────────────');
    console.log('\n🎉 Done!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();


