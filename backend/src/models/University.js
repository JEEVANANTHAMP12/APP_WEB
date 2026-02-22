const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
    },
    location: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    logo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('University', universitySchema);
