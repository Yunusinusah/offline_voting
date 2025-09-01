const { castVote } = require('../services/voteService');

exports.cast = async (req, res) => {
  try {
    // Prefer authenticated token's voterId when available
    const auth = req.user || {};
    const voterId = auth.voterId || req.body.voterId;
    const { electionId, votes } = req.body;
    if (!voterId) return res.status(401).json({ error: 'voter authentication required' });
    if (!Array.isArray(votes)) return res.status(400).json({ error: 'votes must be an array' });
  const otpId = auth.otpId || null;
  const result = await castVote({ voterId, electionId, votes, otpId });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
