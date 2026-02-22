const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      tls: true,
      tlsAllowInvalidCertificates: isDev,
      tlsAllowInvalidHostnames: isDev,
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
