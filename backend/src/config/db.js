const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Atlas-recommended options
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 10000,  // fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Atlas Error: ${error.message}`);
    process.exit(1);
  }
};

// Emit connection events for visibility
mongoose.connection.on('disconnected', () =>
  console.warn('⚠️  MongoDB Atlas disconnected')
);
mongoose.connection.on('reconnected', () =>
  console.log('🔄 MongoDB Atlas reconnected')
);

module.exports = connectDB;
