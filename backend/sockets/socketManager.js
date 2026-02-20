let ioInstance = null;

/**
 * Initialize Socket.io and store instance globally
 * @param {Server} io - Socket.io server instance
 */
const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Client joins admin room if they identify as admin
    socket.on('join_admin', () => {
      socket.join('admins');
      console.log(`🔐 Socket ${socket.id} joined admins room`);
    });

    // Client joins general campus room
    socket.on('join_campus', () => {
      socket.join('campus');
      console.log(`🏫 Socket ${socket.id} joined campus room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * Get the io instance for use in controllers
 * @returns {Server} Socket.io instance
 */
const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized');
  }
  return ioInstance;
};

/**
 * Emit event to all connected admin clients
 * @param {string} event - Event name
 * @param {object} data - Event payload
 */
const emitToAdmins = (event, data) => {
  if (ioInstance) {
    ioInstance.to('admins').emit(event, data);
  }
};

/**
 * Emit event to all connected clients (campus-wide)
 * @param {string} event - Event name
 * @param {object} data - Event payload
 */
const emitToCampus = (event, data) => {
  if (ioInstance) {
    ioInstance.to('campus').emit(event, data);
    ioInstance.to('admins').emit(event, data);
  }
};

module.exports = { initSocket, getIO, emitToAdmins, emitToCampus };
