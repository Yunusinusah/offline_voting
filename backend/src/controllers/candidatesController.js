const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    let { portfolio_id, full_name, ballot_num, election_id } = req.body;
    if (ballot_num !== undefined && ballot_num !== null && ballot_num !== '') {
      const n = Number(ballot_num);
      ballot_num = Number.isFinite(n) ? Math.floor(n) : null;
    } else {
      ballot_num = null;
    }
  if (!models) throw new Error('ORM not initialized');
  const profile_picture = req.file ? `/public/uploads/${req.file.filename}` : null;
  const c = await models.Candidate.create({ portfolio_id, full_name, profile_picture, ballot_num, election_id });
  res.status(201).json(c.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const changes = req.body;
    if (changes.ballot_num !== undefined) {
      if (changes.ballot_num !== null && changes.ballot_num !== '') {
        const n = Number(changes.ballot_num);
        changes.ballot_num = Number.isFinite(n) ? Math.floor(n) : null;
      } else {
        changes.ballot_num = null;
      }
    }
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
