const db = require('../config/db');
const { sequelize, models } = db;
const { Op } = require('sequelize'); // Import Op directly from sequelize package
const crypto = require('crypto');

function generateCode(length = 6) {
  const max = 10 ** length;
  const num = Math.floor(Math.random() * (max - 1));
  return String(num).padStart(length, '0');
}

async function generateOTP(voterId, ttlMinutes = 30) {
  const code = generateCode(6);
  const now = new Date();
  const expires = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  
  if (!models) throw new Error('ORM not initialized');
  
  const otp = await models.Otp.create({ 
    voter_id: voterId, 
    code, 
    expires_at: expires, 
    used: false 
  });
  
  return { id: otp.id, code, expires_at: expires };
}

async function verifyOTP(voterId, code) {
  const now = new Date();
  const utcNow = new Date(now.toUTCString());

  if (!models) throw new Error('ORM not initialized');
  
  const otp = await models.Otp.findOne({ 
    where: { 
      voter_id: voterId, 
      code, 
      used: false, 
      expires_at: { 
        [Op.gt]: now
      } 
    } 
  });
  if (!otp) return false;

  await models.Log.create({ 
    voter_id: voterId, 
    action: 'verify_otp', 
    details: `OTP ${otp.id} validated for login` 
  });

  return otp;
}

module.exports = { generateOTP, verifyOTP };