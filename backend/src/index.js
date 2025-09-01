require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const { initLogger } = require('./config/logger');
const { sequelize } = require('./config/db');
const logger = initLogger();

const corsOptions = {
  origin: 'http://localhost:5173', // Specify the allowed origin
  credentials: true, // Allow sending cookies, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
};

const app = express();
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: logger.stream }));

// static uploads
app.use('/public/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => res.json({ ok: true, service: 'election-backend' }));

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
    await sequelize.sync();
    logger.info('Database synchronized successfully.');
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
  }
})();

module.exports = app;
