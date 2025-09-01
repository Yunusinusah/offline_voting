const express = require('express');
const voteController = require('../controllers/voteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Cast vote (voter token required)
router.post('/', authenticate, voteController.cast);

module.exports = router;
