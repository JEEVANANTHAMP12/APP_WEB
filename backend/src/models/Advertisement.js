const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, default: '' },
    university_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'University',
      default: null, // null = platform-wide
    },
    canteen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Canteen',
      default: null,
    },
    position: {
      type: String,
      enum: ['banner', 'sidebar', 'popup'],
      default: 'banner',
    },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    click_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advertisement', advertisementSchema);
