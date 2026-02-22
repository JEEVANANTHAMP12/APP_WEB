const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require('socket.io');
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      auth: {
        rejectUnauthorized: false, // Allow auth error handling in middleware
      },
    });

    // Middleware: Verify JWT token on connection
    io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);

      // Student joins their personal room - only themselves
      socket.on('join_user_room', (userId) => {
        if (userId !== socket.userId) {
          socket.emit('error', 'Unauthorized: Cannot join another user\'s room');
          return;
        }
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Canteen owner/staff joins canteen room - verify ownership
      socket.on('join_canteen_room', (canteenId) => {
        if (socket.userRole === 'owner' || socket.userRole === 'staff') {
          socket.join(`canteen_${canteenId}`);
          console.log(`Canteen staff ${socket.userId} joined canteen room: ${canteenId}`);
        } else {
          socket.emit('error', 'Unauthorized: Only owners and staff can join canteen rooms');
        }
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id} (User: ${socket.userId})`);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },
};
