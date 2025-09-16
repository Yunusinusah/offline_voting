const jwt = require('jsonwebtoken');
const { models } = require("../models");
const JWT_SECRET = process.env.JWT_SECRET || "replace_this_secret";

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth)
    return res.status(401).json({ error: "missing authorization header" });
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ error: "invalid authorization header" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    if (payload.role === "voter") {
      req.full_user = await models.Voter.findByPk(payload.voterId);
    } else {
      req.full_user = await models.User.findByPk(payload.userId);
    }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'not authenticated' });
    if (allowedRoles.length === 0) return next();
    if (allowedRoles.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };
}

module.exports = { authenticate, authorize };
