const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { models } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET;

let io = null;

function initSocket(server, logger = console) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: 
      // [
        process.env.FRONTEND_URL,
      // ],
      methods: ['GET', 'POST']
    }
  });

  // admin namespace with basic auth validation
  const adminNs = io.of('/admin');

  adminNs.use(async (socket, next) => {
    try {
      const auth = socket.handshake.auth || {};
      const token = auth.token || (typeof auth.authorization === 'string' ? auth.authorization.replace(/^Bearer\s+/i, '') : null);
      if (!token) return next(new Error('missing token'));
      const payload = jwt.verify(token, JWT_SECRET);
      
      if (payload.role === 'voter') {
        socket.full_user = await models.Voter.findByPk(payload.voterId);
      } else {
        socket.full_user = await models.User.findByPk(payload.userId);
      }
      socket.user = payload;
      // allow only admins or superadmins to connect to admin namespace
      if (!payload.role || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
        return next(new Error('forbidden'));
      }
      return next();
    } catch (err) {
      return next(new Error('invalid_token'));
    }
  });

  adminNs.on('connection', (socket) => {
    logger.info && logger.info(`Admin socket connected: ${socket.id} user=${socket.user && socket.user.userId}`);
    socket.on('disconnect', () => {
      logger.info && logger.info(`Admin socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getAdminNamespace() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io.of('/admin');
}

function emitToAdmins(event, payload) {
  try {
    const ns = getAdminNamespace();
    ns.emit(event, payload);
  } catch (err) {
    // fail silently if not initialized
    console.error('emitToAdmins error', err.message || err);
  }
}

module.exports = { initSocket, getAdminNamespace, emitToAdmins };
