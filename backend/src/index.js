require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const routes = require('./routes');
const { initLogger } = require('./config/logger');
const { sequelize } = require('./config/db');
const logger = initLogger();
const { initSocket } = require('./services/socketService');


const corsOptions = {
  origin:
   [
    process.env.FRONTEND_URL,
  ],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: logger.stream }));

// static uploads
app.use(
  "/public/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"), {
    setHeaders: (res, path, stat) => {
      res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      res.set('Access-Control-Allow-Origin', '*');
    }
  })
);

app.use('/api', routes);

app.get('/', (req, res) => res.json({ ok: true, service: 'election-backend' }));

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    await sequelize.sync();
    logger.info('Database synchronized successfully.');

    // initialize sockets
    try {
      initSocket(server, logger);
      logger.info('Socket.IO initialized');
    } catch (err) {
      logger.error('Failed to initialize sockets', err);
    }

    server.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      
      try {
        const { startElectionScheduler } = require('./scheduler/electionScheduler');
        startElectionScheduler(logger);
      } catch (err) {
        logger.error('Failed to start election scheduler', err);
      }
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
})();

module.exports = server;
