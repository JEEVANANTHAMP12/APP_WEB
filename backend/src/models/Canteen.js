const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema(
  {
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Canteen name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    commission_percentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'rejected'],
      default: 'pending',
    },
    opening_time: {
      type: String,
      default: '08:00',
    },
    closing_time: {
      type: String,
      default: '20:00',
    },
    is_open: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    total_orders: {
      type: Number,
      default: 0,
    },
    total_earnings: {
      type: Number,
      default: 0,
    },
    bank_details: {
      account_number: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      account_holder: { type: String, default: '' },
    },
    phone: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Canteen', canteenSchema);
