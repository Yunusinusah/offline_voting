const express = require('express');
const healthController = require('../controllers/healthController');
const departmentsRouter = require('./departments');
const votesRouter = require('./votes');
const authRouter = require('./auth');
const votersRouter = require('./voters');
const resultsRouter = require('./results');
const adminRouter = require('./admin');

const router = express.Router();

router.get('/health', healthController.health);
router.use('/departments', departmentsRouter);
router.use('/votes', votesRouter);
router.use('/auth', authRouter);
router.use('/voters', votersRouter);
router.use('/results', resultsRouter);
router.use('/admin', adminRouter);

module.exports = router;
