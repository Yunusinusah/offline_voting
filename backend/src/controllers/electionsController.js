const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    const { title, start_time, end_time, is_active, allow_under_voting } = req.body;
  if (!models) throw new Error('ORM not initialized');
  const election = await models.Election.create({ title, start_time, end_time, is_active: !!is_active, max_votes_per_voter: max_votes_per_voter || 1, allow_under_voting: allow_under_voting === undefined ? true : !!allow_under_voting });
  res.status(201).json(election.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  const rows = await models.Election.findAll({ order: [['created_at', 'DESC']] });
  res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  const election = await models.Election.findByPk(req.params.id);
  if (!election) return res.status(404).json({ error: 'not found' });
  res.json(election.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const changes = req.body;
  if (!models) throw new Error('ORM not initialized');
  await models.Election.update(changes, { where: { id: req.params.id } });
  const election = await models.Election.findByPk(req.params.id);
  res.json(election.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  await models.Election.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
