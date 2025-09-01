const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    const { portfolio_id, full_name, ballot_num, election_id } = req.body;
  if (!models) throw new Error('ORM not initialized');
  const profile_picture = req.file ? `/public/uploads/${req.file.filename}` : null;
  const c = await models.Candidate.create({ portfolio_id, full_name, profile_picture, ballot_num, election_id });
  res.status(201).json(c.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listByElection = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  const rows = await models.Candidate.findAll({ where: { election_id: req.params.electionId }, order: [['ballot_num', 'ASC']] });
  res.json(rows.map(r => r.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const changes = req.body;
  if (!models) throw new Error('ORM not initialized');
  if (req.file) changes.profile_picture = `/public/uploads/${req.file.filename}`;
  await models.Candidate.update(changes, { where: { id: req.params.id } });
  const c = await models.Candidate.findByPk(req.params.id);
  res.json(c.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  await models.Candidate.destroy({ where: { id: req.params.id } });
  res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
