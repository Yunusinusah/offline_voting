const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, verifyOTP } = require('../services/otpService');
const { orm } = db;
const models = orm ? orm.models : null;

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!models) throw new Error("ORM not initialized");
    const user = await models.User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "invalid credentials" });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "8h",
    });
    if(user.role === "admin" || user.role=="polling_agent") {
      if (!user.election_id) return res.status(500).json({ error: "You are not assigned an election, contact Super admin"})
    }
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate OTP for a voter (used by polling agents)
exports.generateVoterOTP = async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!models) throw new Error("ORM not initialized");
    const voter = await models.Voter.findOne({ where: { student_id } });
    if (!voter) return res.status(404).json({ error: "voter not found" });
    // if voter has voted, send an error message
    if (voter.has_voted)      return res.status(400).json({ error: "voter has already voted" });
    const otp = await generateOTP(voter.id);
    // For offline use, we return the OTP code in response so the polling agent can show it to the voter.
    res.json({ otp: otp.code, expires_at: otp.expires_at });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP and issue voter JWT
exports.verifyVoterOTP = async (req, res) => {
  try {
    const { student_id, code } = req.body;
    if (!models) throw new Error("ORM not initialized");
    const voter = await models.Voter.findOne({
      where: { student_id },
      include: [
        {
          model: models.Election,
          as: "Election",
          attributes: ["id", "title", "is_active"],
        },
      ],
    });
    if (!voter) return res.status(404).json({ error: "voter not found" });
    const otp = await verifyOTP(voter.id, code);
    if (!otp) return res.status(400).json({ error: "invalid or expired code" });
    if (!voter.Election || !voter.Election.is_active)
      return res.status(403).json({ error: "election is not active" });

    // Include otp id in token so it can be consumed (marked used) when the vote is cast.
    const token = jwt.sign(
      { voterId: voter.id, role: "voter", otpId: otp.id },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new admin (only superadmin)
exports.createAdmin = async (req, res) => {
  try {
    const { username, password, email, election: election_id } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "username and password required" });
    if (!models) throw new Error("ORM not initialized");
    const existing = await models.User.findOne({ where: { username } });
    if (existing)
      return res.status(409).json({ error: "username already exists" });
    const user = await models.User.create({
      username,
      password,
      email,
      role: "admin",
      election_id: election_id || null,
    });
    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      election_id: user.election_id,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdmins = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const admins = await models.User.findAll({
      where: { role: "admin" },
      attributes: { exclude: ["password"] },
    });
    res.json({ results: admins });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, election: election_id } = req.body;
    if (!models) throw new Error("ORM not initialized");
    const admin = await models.User.findOne({ where: { id, role: "admin" } });
    if (!admin) return res.status(404).json({ error: "admin not found" });
    if (email) {
      const existing = await models.User.findOne({ where: { email } });
      if (existing && existing.id !== admin.id)
        return res.status(409).json({ error: "email already exists" });
      admin.email = email;
      admin.username = username;
    }
    if (election_id !== undefined) {
      admin.election_id = election_id;
    }
    await admin.save();
    res.json({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      email: admin.email,
      election_id: admin.election_id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!models) throw new Error("ORM not initialized");
    const admin = await models.User.findOne({ where: { id, role: "admin" } });
    if (!admin) return res.status(404).json({ error: "admin not found" });
    await admin.destroy();
    res.json({ message: "admin deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPollingAgent = async (req, res) => {
  try {
    const { username, password, email, election_id } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    if (!models) throw new Error("ORM not initialized");
    const existing = await models.User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "email already exists" });
    const user = await models.User.create({
      username: username || null,
      password,
      role: "polling_agent",
      email: email,
      election_id: req.full_user.election_id || null,
    });
    res
      .status(201)
      .json({ id: user.id, username: user.username,email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createVoter = async (req, res) => {
  try {
    const { student_id, level, gender, election_id } = req.body;
    if (!student_id)
      return res.status(400).json({ error: "student_id required" });
    if (!models) throw new Error("ORM not initialized");
    const existing = await models.Voter.findOne({ where: { student_id } });
    if (existing)
      return res.status(409).json({ error: "student_id already exists" });

    // Voters do not require a password; create without one. Password field is left null.
    const voter = await models.Voter.create({
      student_id,
      password: null,
      level: level || null,
      gender: gender || null,
      election_id: election_id || null,
    });
    res.status(201).json({ id: voter.id, student_id: voter.student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");
    const agents = await models.User.findAll({
      where: { role: "polling_agent", election_id: req.full_user.election_id },
      attributes: { exclude: ["password"] },
    });
    res.json({ results: agents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!models) throw new Error("ORM not initialized");
    const agent = await models.User.findOne({
      where: { id, role: "polling_agent" },
    });
    if (!agent) return res.status(404).json({ error: "agent not found" });
    await agent.destroy();
    res.json({ message: "agent deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVoters = async (req, res) => {
  try {
    if (!models) throw new Error("ORM not initialized");

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      200,
      Math.max(10, parseInt(req.query.limit || "50", 10))
    );
    const offset = (page - 1) * limit;

    const q = (req.query.q || "").trim();

    const where = {};
    if (q) {
      where[models.Sequelize.Op.or] = [
        {
          student_id: {
            [models.Sequelize.Op.iLike || models.Sequelize.Op.like]: `%${q}%`,
          },
        },
        {
          level: {
            [models.Sequelize.Op.iLike || models.Sequelize.Op.like]: `%${q}%`,
          },
        },
        {
          gender: {
            [models.Sequelize.Op.iLike || models.Sequelize.Op.like]: `%${q}%`,
          },
        },
      ];
    }

    const { count, rows } = await models.Voter.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    res.json({ results: rows, total: count, page, limit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
