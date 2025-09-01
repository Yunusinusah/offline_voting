const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.electionResults = async (req, res) => {
  try {
    if (!models) throw new Error('ORM not initialized');
    const electionId = req.params.id;
    const total = await models.Vote.count({ where: { election_id: electionId, skip_vote: false } });
    const skipped = await models.Vote.count({ where: { election_id: electionId, skip_vote: true } });

    const [rows] = await models.sequelize.query(`
      SELECT c.id, c.full_name, c.profile_picture, COUNT(v.id) as votes
      FROM candidates c
      LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = :eid
      WHERE c.election_id = :eid
      GROUP BY c.id
      ORDER BY votes DESC
    `, { replacements: { eid: electionId }, type: models.sequelize.QueryTypes.SELECT });

    // when using sequelize.query with QueryTypes.SELECT, result is array of rows
    const rowsArr = Array.isArray(rows) ? rows : rows;
    const results = rowsArr.map((r) => ({ id: r.id, full_name: r.full_name, profile_picture: r.profile_picture, votes: parseInt(r.votes, 10) || 0, percentage: total > 0 ? ((parseInt(r.votes, 10) / total) * 100).toFixed(2) : '0.00' }));

    res.json({ electionId, total_votes: total, skipped_votes: skipped, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
