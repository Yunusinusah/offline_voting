const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    const { name, priority, level, election_id } = req.body;
  if (!models) throw new Error('ORM not initialized');
  const p = await models.Portfolio.create({ name, priority: priority || 0, level, election_id });
  res.status(201).json(p.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listByElection = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  const rows = await models.Portfolio.findAll({ where: { election_id: req.params.electionId }, order: [['priority','ASC']] });
  res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  await models.Portfolio.update(req.body, { where: { id: req.params.id } });
  const p = await models.Portfolio.findByPk(req.params.id);
  res.json(p.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  await models.Portfolio.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
