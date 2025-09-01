// provide Sequelize models and instance
let sequelize = null;
let models = null;
try {
	const m = require('../models');
	sequelize = m.sequelize;
	models = m.models;
} catch (err) {
    console.error('Error loading models:', err);
	// models not available
	sequelize = null;
	models = null;
}

module.exports = { sequelize, models, orm: { sequelize, models } };
