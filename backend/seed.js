/**
 * Seed script — creates demo users + a university + a canteen
 * Run once: node seed.js
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

const UniversitySchema = new mongoose.Schema({
  name: String, location: String, code: String, status: { type: String, default: 'active' },
}, { timestamps: true });

const CanteenSchema = new mongoose.Schema({
  name: String, university_id: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String, phone: String, image: String,
  opening_time: String, closing_time: String,
  is_open: { type: Boolean, default: true },
  status: { type: String, default: 'active' },
  commission_percentage: { type: Number, default: 10 },
  total_earnings: { type: Number, default: 0 },
  total_orders: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
}, { timestamps: true });

const MenuItemSchema = new mongoose.Schema({
  canteen_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen' },
  name: String, description: String, price: Number,
  category: String, image: String,
  is_veg: { type: Boolean, default: true },
  is_available: { type: Boolean, default: true },
  discount_percentage: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const University = mongoose.model('University', UniversitySchema);
const Canteen = mongoose.model('Canteen', CanteenSchema);
const MenuItem = mongoose.model('MenuItem', MenuItemSchema);

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      University.deleteMany({}),
      Canteen.deleteMany({}),
      MenuItem.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Hash password
    const hash = await bcrypt.hash('demo123', 12);

    // Create universities
    const [uni1, uni2] = await University.create([
      { name: 'Delhi University', location: 'New Delhi, Delhi', code: 'DU' },
      { name: 'Mumbai University', location: 'Mumbai, Maharashtra', code: 'MU' },
    ]);
    console.log('🏫 Created universities');

    // Create admin
    const admin = await User.create({
      name: 'Admin User', email: 'admin@demo.com', password: hash,
      role: 'admin', phone: '9000000001',
    });

    // Create owner
    const owner = await User.create({
      name: 'Canteen Owner', email: 'owner@demo.com', password: hash,
      role: 'owner', phone: '9000000002', is_approved: true,
    });

    // Create canteen for the owner
    const canteen = await Canteen.create({
      name: 'Campus Bites', university_id: uni1._id, owner_id: owner._id,
      description: 'Your favourite campus food stop — burgers, wraps, thalis & more.',
      phone: '9000000005', opening_time: '08:00', closing_time: '22:00',
      image: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600',
      is_open: true, status: 'active',
    });

    // Link owner → canteen
    owner.canteen_id = canteen._id;
    await owner.save();

    // Create staff
    const staff = await User.create({
      name: 'Staff Member', email: 'staff@demo.com', password: hash,
      role: 'staff', phone: '9000000003', canteen_id: canteen._id,
    });

    // Create student
    const student = await User.create({
      name: 'Test Student', email: 'student@demo.com', password: hash,
      role: 'student', university_id: uni1._id, phone: '9000000004',
      wallet_balance: 500,
    });

    console.log('👤 Created users:');
    console.log('   Student  → student@demo.com / demo123');
    console.log('   Owner    → owner@demo.com   / demo123');
    console.log('   Staff    → staff@demo.com   / demo123');
    console.log('   Admin    → admin@demo.com   / demo123');

    // Create menu items
    await MenuItem.create([
      { canteen_id: canteen._id, name: 'Classic Burger', description: 'Juicy grilled patty with cheese', price: 120, category: 'Burgers', is_veg: false, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
      { canteen_id: canteen._id, name: 'Paneer Wrap', description: 'Grilled paneer with mint chutney', price: 90, category: 'Wraps', is_veg: true, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400' },
      { canteen_id: canteen._id, name: 'Veg Thali', description: 'Dal, sabzi, rice, roti, salad', price: 80, category: 'Thali', is_veg: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400' },
      { canteen_id: canteen._id, name: 'Chicken Biryani', description: 'Fragrant basmati rice with chicken', price: 150, category: 'Biryani', is_veg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
      { canteen_id: canteen._id, name: 'Masala Dosa', description: 'Crispy dosa with potato filling', price: 60, category: 'South Indian', is_veg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
      { canteen_id: canteen._id, name: 'Cold Coffee', description: 'Iced coffee with cream', price: 50, category: 'Beverages', is_veg: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
      { canteen_id: canteen._id, name: 'Samosa (2 pcs)', description: 'Crispy fried with potato filling', price: 30, category: 'Snacks', is_veg: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
      { canteen_id: canteen._id, name: 'Chocolate Brownie', description: 'Warm fudgy brownie with ice cream', price: 70, category: 'Desserts', is_veg: true, image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400' },
    ]);
    console.log('🍔 Created 8 menu items');

    // Second canteen
    const owner2 = await User.create({
      name: 'Fresh Bites Owner', email: 'owner2@demo.com', password: hash,
      role: 'owner', phone: '9000000006', is_approved: true,
    });
    const canteen2 = await Canteen.create({
      name: 'Fresh Bites', university_id: uni1._id, owner_id: owner2._id,
      description: 'Healthy salads, smoothies & sandwiches on campus.',
      phone: '9000000007', opening_time: '09:00', closing_time: '20:00',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600',
      is_open: true, status: 'active',
    });
    owner2.canteen_id = canteen2._id;
    await owner2.save();

    await MenuItem.create([
      { canteen_id: canteen2._id, name: 'Caesar Salad', description: 'Romaine, croutons, parmesan', price: 110, category: 'Salads', is_veg: true, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },
      { canteen_id: canteen2._id, name: 'Grilled Sandwich', description: 'Cheese, veggies, herbs', price: 70, category: 'Sandwiches', is_veg: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400' },
      { canteen_id: canteen2._id, name: 'Mango Smoothie', description: 'Fresh mango blended with yogurt', price: 60, category: 'Beverages', is_veg: true, image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400' },
      { canteen_id: canteen2._id, name: 'Chicken Club Sandwich', description: 'Triple-decker with grilled chicken', price: 130, category: 'Sandwiches', is_veg: false, image: 'https://images.unsplash.com/photo-1553909489-ec2175ef3f52?w=400' },
    ]);
    console.log('🥗 Created second canteen with 4 items');

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
