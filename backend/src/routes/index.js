const express = require('express');
const healthController = require('../controllers/healthController');
const authRouter = require('./auth');
const votersRouter = require('./voters');
const settingsRouter = require('./settings');
const adminRouter = require('./admin');

const router = express.Router();

router.get('/health', healthController.health);
router.use('/auth', authRouter);
router.use('/voters', votersRouter);
router.use('/settings', settingsRouter);
router.use('/admin', adminRouter);

module.exports = router;
