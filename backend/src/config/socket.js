let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Student joins their personal room
      socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Canteen owner/staff joins canteen room
      socket.on('join_canteen_room', (canteenId) => {
        socket.join(`canteen_${canteenId}`);
        console.log(`Joined canteen room: ${canteenId}`);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};
