const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/admin/login', authController.adminLogin);

// Generate OTP for voter 
router.post('/voter/generate', authenticate, authorize(['polling_agent']), authController.generateVoterOTP);

// Voter Login
router.post('/voter/verify', authController.verifyVoterOTP);

module.exports = router;
