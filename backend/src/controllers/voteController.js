const { castVote } = require('../services/voteService');
const { sequelize, models } = require("../config/db");
const { Op } = require("sequelize");

exports.cast = async (req, res) => {

  const voterId = req.body.voterId || req.full_user.id;
  if (!voterId) return res.status(401).json({ error: 'voter authentication required' });
  if (req.full_user.has_voted) return res.status(403).json({ error: 'voter has already voted' });
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'votes must be an array' });
    const election_id = req.full_user.election_id;
    const result = await castVote({ voterId, electionId: election_id, votes: req.body });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  const restrictions = {
    gender: {
      female: "GENDER_FEMALE_ONLY",
      male: "GENDER_MALE_ONLY",
    },
    level: {
      "100": "LEVEL_1",
      "200": "LEVEL_2",
      "300": "LEVEL_3",
      "400": "LEVEL_4",
      "500": "LEVEL_5",
      "600": "LEVEL_6",
    },
  };
  try {
    const user = await req.full_user;
    if (!models) throw new Error("ORM not initialized");
    
    const allowedRestrictions = ["NONE"]; // always allowed
    if (restrictions.gender[user.gender]) {
      allowedRestrictions.push(restrictions.gender[user.gender]);
    }
    if (restrictions.level[user.level]) {
      allowedRestrictions.push(restrictions.level[user.level]);
    }

    // fetch portfolios where restriction matches allowed set
    const rows = await models.Portfolio.findAll({
      where: {
        election_id: user.election_id,
        restriction_type: allowedRestrictions, // only allowed restrictions
      },
      order: [
        ["priority", "ASC"], // sort portfolios
        [{ model: models.Candidate, as: "candidates" }, "ballot_num", "ASC"], // sort candidates
      ],
      include: [
        {
          model: models.Candidate,
          as: "candidates",
        },
      ],
    });

    // map to JSON and provide legacy fields for frontend
    const mapped = rows.map((r) => {
      const p = r.toJSON();
      p.voting_restriction =
        p.restriction_type === "NONE" ? "general" : p.restriction_type;
      p.restriction_details = p.restriction_details || {};
      return p;
    });
    res.json({mapped, has_voted: req.full_user.has_voted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

