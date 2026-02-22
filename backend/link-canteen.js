/**
 * Links an owner to a canteen in Atlas.
 * Run: node link-canteen.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const UserSchema = new mongoose.Schema({ name: String, email: String, role: String, canteen_id: mongoose.Schema.Types.ObjectId, is_approved: Boolean }, { timestamps: true });
const CanteenSchema = new mongoose.Schema({ name: String, owner_id: mongoose.Schema.Types.ObjectId }, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Canteen = mongoose.model('Canteen', CanteenSchema);

async function link() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to Atlas');

  // Find owner and canteen
  const owner = await User.findOne({ email: 'thomas@gmail.com' });
  const canteen = await Canteen.findOne({ name: /best canteen/i });

  if (!owner) { console.error('❌ Owner thomas@gmail.com not found'); process.exit(1); }
  if (!canteen) { console.error('❌ Canteen "Best Canteen" not found'); process.exit(1); }

  // Link owner → canteen
  owner.canteen_id = canteen._id;
  owner.is_approved = true;
  await owner.save();

  // Link canteen → owner
  canteen.owner_id = owner._id;
  await canteen.save();

  console.log(`✅ Linked "${owner.name}" (${owner.email}) → "${canteen.name}"`);
  process.exit(0);
}

link().catch((err) => { console.error('❌', err.message); process.exit(1); });
