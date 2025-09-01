const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'election_db'
};

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  pool: {
    min: 2,
    max: 10,
    acquire: 30000,
    idle: 10000
  },
  logging: false,
  define: {
    freezeTableName: true,
    underscored: true
  }
});

const models = {};

// Import and initialize models
models.User = require('./user')(sequelize, DataTypes);
models.Department = require('./department')(sequelize, DataTypes);
models.Voter = require('./voter')(sequelize, DataTypes);
models.Election = require('./election')(sequelize, DataTypes);
models.Portfolio = require('./portfolio')(sequelize, DataTypes);
models.Candidate = require('./candidate')(sequelize, DataTypes);
models.Vote = require('./vote')(sequelize, DataTypes);
models.Log = require('./log')(sequelize, DataTypes);
models.Otp = require('./otp')(sequelize, DataTypes);

// Define associations
models.Election.hasMany(models.Portfolio, { foreignKey: 'election_id' });
models.Portfolio.belongsTo(models.Election, { foreignKey: 'election_id' });

models.Portfolio.hasMany(models.Candidate, { foreignKey: 'portfolio_id' });
models.Candidate.belongsTo(models.Portfolio, { foreignKey: 'portfolio_id' });

models.Election.hasMany(models.Candidate, { foreignKey: 'election_id' });
models.Candidate.belongsTo(models.Election, { foreignKey: 'election_id' });

models.Election.hasMany(models.Vote, { foreignKey: 'election_id' });
models.Vote.belongsTo(models.Election, { foreignKey: 'election_id' });

models.Candidate.hasMany(models.Vote, { foreignKey: 'candidate_id' });
models.Vote.belongsTo(models.Candidate, { foreignKey: 'candidate_id' });

models.Portfolio.hasMany(models.Vote, { foreignKey: 'portfolio_id' });
models.Vote.belongsTo(models.Portfolio, { foreignKey: 'portfolio_id' });

models.Voter.hasMany(models.Otp, { foreignKey: 'voter_id' });
models.Otp.belongsTo(models.Voter, { foreignKey: 'voter_id' });

models.User.belongsTo(models.Election, { foreignKey: 'election_id' });
models.Voter.belongsTo(models.Election, { foreignKey: 'election_id' });

module.exports = { sequelize, Sequelize, models };