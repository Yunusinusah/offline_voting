const express = require('express');
const resultsController = require('../controllers/resultsController');

const router = express.Router();

router.get('/election/:id', resultsController.electionResults);

module.exports = router;
