const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

function initLogger() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: path.join(logsDir, 'error.log'), level: 'error' }),
      new winston.transports.File({ filename: path.join(logsDir, 'combined.log') })
    ]
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({ format: winston.format.simple() }));
  }

  logger.stream = {
    write: (message) => logger.info(message.trim())
  };

  return logger;
}

module.exports = { initLogger };
