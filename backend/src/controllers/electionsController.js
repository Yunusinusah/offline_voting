const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

exports.create = async (req, res) => {
  try {
    const {
      title,
      start_time,
      end_time,
      allow_under_voting,
    } = req.body;
    const start = start_time ? new Date(start_time) : null;
    const end = end_time ? new Date(end_time) : null;
    const serverCurrentTime = new Date();
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ error: "Invalid or missing start_time/end_time" });
    }
    if (start.getTime() > end.getTime()) {
      return res
        .status(400)
        .json({ error: "Start time must not be after end_time" });
    }
    // also add that start time must be after current time
    if (start.getTime() <= serverCurrentTime.getTime()) {
      return res
        .status(400)
        .json({ error: "Start time must be in the future" });
    }

    if (!models) throw new Error("ORM not initialized");

    const is_active =
      start.getTime() <= serverCurrentTime.getTime() &&
      end.getTime() >= serverCurrentTime.getTime();

    const election = await models.Election.create({
      title,
      start_time,
      end_time,
      is_active,
      max_votes_per_voter: 1,
      allow_under_voting:
        allow_under_voting === undefined ? true : !!allow_under_voting,
    });
    const ejson = election.toJSON();
    ejson.server_time = new Date();
    try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'create', details: `election ${election.id} created` }); } catch (e) { /* best effort */ }
    res.status(201).json(ejson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const elections = await models.Election.findAll();
    const electionsWithServerTime = elections.map((election) => {
      const electionJson = election.toJSON();
      electionJson.server_time = new Date();
      return electionJson;
    });
    res.json(electionsWithServerTime);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  const user_details = await req.full_user;
  try {
    if (user.election_id != req.params.id) {
      return res.status(403).json({ error: "forbidden" });
    }

    if (!models) throw new Error("ORM not initialized");
    const election = await models.Election.findByPk(req.params.id);
    if (!election) return res.status(404).json({ error: "not found" });
    const getJson = election.toJSON();
    getJson.server_time = new Date();
    res.json(getJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.myElection = async (req, res) => {
  const user_details = await req.full_user;
  try {
    if (!user_details.election_id) {
      return res
        .status(400)
        .json({ error: "user not assigned to any election" });
    }
    if (!models) throw new Error("ORM not initialized");
    const election = await models.Election.findByPk(user_details.election_id);
    if (!election) return res.status(404).json({ error: "not found" });
    const myJson = election.toJSON();
    myJson.server_time = new Date();
    res.json(myJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.update = async (req, res) => {
  try {
    const changes = req.body;
    if (!models) throw new Error("ORM not initialized");

    // Fetch existing election to validate start/end ordering when partial updates are provided
    const existing = await models.Election.findByPk(req.params.id);
    if (!existing) return res.status(404).json({ error: "not found" });

    const newStart = changes.start_time
      ? new Date(changes.start_time)
      : new Date(existing.start_time);
    const newEnd = changes.end_time
      ? new Date(changes.end_time)
      : new Date(existing.end_time);
    if (
      !newStart ||
      !newEnd ||
      isNaN(newStart.getTime()) ||
      isNaN(newEnd.getTime())
    ) {
      return res.status(400).json({ error: "Invalid start_time or end_time" });
    }
    if (newStart.getTime() > newEnd.getTime()) {
      return res
        .status(400)
        .json({ error: "start_time must not be after end_time" });
    }

    await models.Election.update(changes, { where: { id: req.params.id } });
    const election = await models.Election.findByPk(req.params.id);
    const upJson = election.toJSON();
    upJson.server_time = new Date();
    try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'update', details: `election ${req.params.id} updated` }); } catch (e) { /* best effort */ }
    res.json(upJson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adjustEndTime = async (req, res) => {
  try {
    const fullUser = await req.full_user;
    const { end_time } = req.body;
    if (!end_time) return res.status(400).json({ error: 'end_time is required' });
    if (!models) throw new Error('ORM not initialized');

    const electionId = fullUser && fullUser.election_id;
    if (!electionId) {
      return res.status(400).json({ error: 'no election associated with authenticated user' });
    }

    const election = await models.Election.findByPk(electionId);
    if (!election) return res.status(404).json({ error: 'not found' });

    const isActive = !!election.is_active;
    if (!isActive) {
      return res.status(400).json({ error: 'election is not active; end_time can only be adjusted while active' });
    }

    const newEnd = new Date(end_time);
    if (isNaN(newEnd.getTime())) return res.status(400).json({ error: 'invalid end_time' });
    const start = election.start_time ? new Date(election.start_time) : null;
    if (start && start.getTime() > newEnd.getTime()) {
      return res.status(400).json({ error: 'end_time must not be before start_time' });
    }

    await models.Election.update({ end_time: newEnd }, { where: { id: electionId } });
    const updated = await models.Election.findByPk(electionId);
    const json = updated.toJSON();
    json.server_time = new Date();
    try { await models.Log.create({ user_id: fullUser && fullUser.id ? fullUser.id : null, action: 'update', details: `election ${electionId} end_time adjusted to ${newEnd.toISOString()}` }); } catch (e) { /* best effort */ }
    res.json(json);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const { sequelize } = require('../config/db');
    await sequelize.transaction(async (trx) => {
      const election = await models.Election.findByPk(req.params.id, { transaction: trx });
      if (!election) return res.status(404).json({ error: 'not found' });
      await election.destroy({ transaction: trx });
      try { await models.Log.create({ user_id: req.full_user && req.full_user.id ? req.full_user.id : null, action: 'delete', details: `election ${req.params.id} deleted` }); } catch (e) { /* best effort */ }
      res.json({ ok: true });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
