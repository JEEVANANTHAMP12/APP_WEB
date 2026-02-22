require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const socketConfig = require('./src/config/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server (required for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
socketConfig.init(server);

server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🍽️  Canteen Platform API Server      ║
  ║   🚀 Running on port: ${PORT}             ║
  ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}         ║
  ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});
