const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateOTP, verifyOTP } = require('../services/otpService');
const { orm } = db;
const models = orm ? orm.models : null;

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
  if (!models) throw new Error('ORM not initialized');
  const user = await models.User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Generate OTP for a voter (used by polling agents)
exports.generateVoterOTP = async (req, res) => {
  try {
    const { student_id } = req.body;
  if (!models) throw new Error('ORM not initialized');
  const voter = await models.Voter.findOne({ where: { student_id } });
    if (!voter) return res.status(404).json({ error: 'voter not found' });
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
  if (!models) throw new Error('ORM not initialized');
  const voter = await models.Voter.findOne({ where: { student_id } });
    if (!voter) return res.status(404).json({ error: 'voter not found' });
    const otp = await verifyOTP(voter.id, code);
    if (!otp) return res.status(400).json({ error: 'invalid or expired code' });

    // Include otp id in token so it can be consumed (marked used) when the vote is cast.
    const token = jwt.sign({ voterId: voter.id, role: 'voter', otpId: otp.id }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new admin (only superadmin)
exports.createAdmin = async (req, res) => {
  try {
    const { username, password, email, election_id } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (!models) throw new Error('ORM not initialized');
    // Check existing
    const existing = await models.User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ error: 'username already exists' });
  // model hooks will hash the password
  const user = await models.User.create({ username, password, role: 'admin', email: email || null, election_id: election_id || null });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create polling agent (admin or superadmin)
exports.createPollingAgent = async (req, res) => {
  try {
    const { username, password, email, election_id } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    if (!models) throw new Error('ORM not initialized');
    const existing = await models.User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ error: 'username already exists' });
  // model hooks will hash the password
  const user = await models.User.create({ username, password, role: 'polling_agent', email: email || null, election_id: election_id || null });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create voter (admin or superadmin)
// Create voter (admin or superadmin)
exports.createVoter = async (req, res) => {
  try {
    const { student_id, level, gender, election_id } = req.body;
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    if (!models) throw new Error('ORM not initialized');
    const existing = await models.Voter.findOne({ where: { student_id } });
    if (existing) return res.status(409).json({ error: 'student_id already exists' });

    // Voters do not require a password; create without one. Password field is left null.
    const voter = await models.Voter.create({ student_id, password: null, level: level || null, gender: gender || null, election_id: election_id || null });
    res.status(201).json({ id: voter.id, student_id: voter.student_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
