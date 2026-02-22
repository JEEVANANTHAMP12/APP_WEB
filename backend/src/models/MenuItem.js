const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    canteen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    is_veg: {
      type: Boolean,
      default: true,
    },
    preparation_time: {
      type: Number, // minutes
      default: 10,
    },
    rating: {
      type: Number,
      default: 0,
    },
    total_orders: {
      type: Number,
      default: 0,
    },
    discount_percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
