const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    const {
      name,
      priority,
      level,
      election_id,
      maximum_candidates,
      restriction_type,
      restriction_details,
    } = req.body;
    if (!models) throw new Error("ORM not initialized");
    const p = await models.Portfolio.create({
      name,
      priority: priority || 0,
      level,
      election_id,
      maximum_candidates,
      restriction_type: restriction_type || "NONE",
      restriction_details: restriction_details || null,
    });
    const json = p.toJSON();
    // maintain backward compatibility fields used by frontend
    json.voting_restriction =
      json.restriction_type === "NONE" ? "general" : json.restriction_type;
    json.restriction_details = json.restriction_details || {};
    res.status(201).json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const rows = await models.Portfolio.findAll({
  where: { election_id: req.full_user.election_id },
  order: [
    ["priority", "ASC"],                                // sort portfolios
    [{ model: models.Candidate, as: "candidates" }, "ballot_num", "ASC"], // sort candidates
  ],
  include: [
    {
      model: models.Candidate,
      as: "candidates",
    },
  ],
});

    const mapped = rows.map((r) => {
      const p = r.toJSON();
      p.voting_restriction =
        p.restriction_type === "NONE" ? "general" : p.restriction_type;
      p.restriction_details = p.restriction_details || {};
      return p;
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const allowed = [
      "name",
      "priority",
      "level",
      "election_id",
      "maximum_candidates",
      "restriction_type",
      "restriction_details",
    ];
    const payload = {};
    Object.keys(req.body || {}).forEach((k) => {
      if (allowed.includes(k)) payload[k] = req.body[k];
    });
    await models.Portfolio.update(payload, { where: { id: req.params.id } });
    const p = await models.Portfolio.findByPk(req.params.id);
    const json = p.toJSON();
    json.voting_restriction =
      json.restriction_type === "NONE" ? "general" : json.restriction_type;
    json.restriction_details = json.restriction_details || {};
    res.json(json);
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
