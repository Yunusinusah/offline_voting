const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/admin/login', authController.adminLogin);

// Generate OTP for voter (requires polling agent or admin) - here we gate to polling_agent and admin
router.post('/voter/generate', authenticate, authorize(['polling_agent', 'admin', 'superadmin']), authController.generateVoterOTP);

// Verify OTP (voter flow)
router.post('/voter/verify', authController.verifyVoterOTP);

module.exports = router;
