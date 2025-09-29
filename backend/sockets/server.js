const jwt = require('jsonwebtoken');

function createSocketServer(httpServer, corsOrigins) {
  const { Server } = require('socket.io');
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization']
    }
  });

  // Use a stable namespace without API prefix
  const nsp = io.of('/sockets');

  // No authorization required: optionally accept userId from handshake
  nsp.use((socket, next) => {
    const userId = socket.handshake.auth?.userId || null;
    socket.user = userId ? { id: userId } : null;
    return next();
  });

  require('./privateChats')(nsp);
  require('./groupChats')(nsp);
  require('./notifications')(nsp);

  return io;
}

module.exports = { createSocketServer };


