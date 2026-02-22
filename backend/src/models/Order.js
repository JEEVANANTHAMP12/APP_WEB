const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderItemSchema = new mongoose.Schema({
  menu_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      unique: true,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    canteen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      required: true,
    },
    items: [orderItemSchema],
    total_amount: {
      type: Number,
      required: true,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    commission_amount: {
      type: Number,
      default: 0,
    },
    net_amount: {
      type: Number, // total_amount - commission
      default: 0,
    },
    payment_method: {
      type: String,
      enum: ['online', 'cash_on_pickup', 'wallet'],
      default: 'online',
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpay_order_id: {
      type: String,
      default: null,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    order_status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled'],
      default: 'placed',
    },
    qr_code: {
      type: String,
      default: () => uuidv4(),
    },
    special_instructions: {
      type: String,
      default: '',
    },
    estimated_time: {
      type: Number, // minutes
      default: 15,
    },
    status_history: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
