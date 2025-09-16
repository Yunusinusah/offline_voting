const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Database configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
models.Voter = require('./voter')(sequelize, DataTypes);
models.Election = require('./election')(sequelize, DataTypes);
models.Portfolio = require('./portfolio')(sequelize, DataTypes);
models.Candidate = require('./candidate')(sequelize, DataTypes);
models.Vote = require('./vote')(sequelize, DataTypes);
models.Log = require('./log')(sequelize, DataTypes);
models.Otp = require('./otp')(sequelize, DataTypes);
models.Setting = require('./setting')(sequelize, DataTypes);

// Define associations
// Election -> Portfolio
models.Election.hasMany(models.Portfolio, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Portfolio.belongsTo(models.Election, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

models.Portfolio.hasMany(models.Candidate, {
  foreignKey: "portfolio_id",
  as: "candidates",
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


models.Candidate.belongsTo(models.Portfolio, { foreignKey: "portfolio_id", onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Election -> Candidate
models.Election.hasMany(models.Candidate, { foreignKey: "election_id", onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Candidate.belongsTo(models.Election, { foreignKey: "election_id", onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Election -> Vote
models.Election.hasMany(models.Vote, { foreignKey: "election_id", onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Vote.belongsTo(models.Election, { foreignKey: "election_id", onDelete: 'CASCADE', onUpdate: 'CASCADE', as: 'Election' });

models.Candidate.hasMany(models.Vote, { foreignKey: 'candidate_id', as: 'votes' });
models.Vote.belongsTo(models.Candidate, { foreignKey: 'candidate_id' });

models.Portfolio.hasMany(models.Vote, { foreignKey: 'portfolio_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Vote.belongsTo(models.Portfolio, { foreignKey: 'portfolio_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

models.Voter.hasMany(models.Otp, { foreignKey: 'voter_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Otp.belongsTo(models.Voter, { foreignKey: 'voter_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

models.User.belongsTo(models.Election, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Voter.belongsTo(models.Election, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Settings can optionally be scoped to an election
models.Election.hasMany(models.Setting, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
models.Setting.belongsTo(models.Election, { foreignKey: 'election_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

models.Election.addHook('beforeDestroy', 'cascadeRelated', async (election, options) => {
  const t = options && options.transaction ? options.transaction : null;
  
  await Promise.all([
    models.Vote.destroy({ where: { election_id: election.id }, transaction: t }),
    models.Candidate.destroy({ where: { election_id: election.id }, transaction: t }),
    models.Portfolio.destroy({ where: { election_id: election.id }, transaction: t }),
    models.Setting.destroy({ where: { election_id: election.id }, transaction: t }),
    models.User.destroy({ where: { election_id: election.id }, transaction: t })
  ]);

  // Delete OTPs belonging to voters for this election, then delete the voters
  const voters = await models.Voter.findAll({ where: { election_id: election.id }, attributes: ['id'], transaction: t });
  const voterIds = voters.map(v => v.id);
  if (voterIds.length > 0) {
    await models.Otp.destroy({ where: { voter_id: voterIds }, transaction: t });
    await models.Voter.destroy({ where: { id: voterIds }, transaction: t });
  }
});

module.exports = { sequelize, Sequelize, models };