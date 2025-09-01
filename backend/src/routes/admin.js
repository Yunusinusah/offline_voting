const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const electionsController = require('../controllers/electionsController');
const portfoliosController = require('../controllers/portfoliosController');
const candidatesController = require('../controllers/candidatesController');
const authController = require('../controllers/authController');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Admin-only CRUD for elections
router.post('/elections', authenticate, authorize(['admin','superadmin']), electionsController.create);
router.get('/elections', authenticate, authorize(['admin','superadmin']), electionsController.list);
router.get('/elections/:id', authenticate, authorize(['admin','superadmin']), electionsController.get);
router.put('/elections/:id', authenticate, authorize(['admin','superadmin']), electionsController.update);
router.delete('/elections/:id', authenticate, authorize(['admin','superadmin']), electionsController.remove);

// Portfolios
router.post('/portfolios', authenticate, authorize(['admin','superadmin']), portfoliosController.create);
router.get('/portfolios/election/:electionId', portfoliosController.listByElection);
router.put('/portfolios/:id', authenticate, authorize(['admin','superadmin']), portfoliosController.update);
router.delete('/portfolios/:id', authenticate, authorize(['admin','superadmin']), portfoliosController.remove);

// Candidates (upload picture)
router.post('/candidates', authenticate, authorize(['admin','superadmin']), upload.single('profile_picture'), candidatesController.create);
router.get('/candidates/election/:electionId', authenticate, authorize(['admin','superadmin']), candidatesController.listByElection);
router.put('/candidates/:id', authenticate, authorize(['admin','superadmin']), upload.single('profile_picture'), candidatesController.update);
router.delete('/candidates/:id', authenticate, authorize(['admin','superadmin']), candidatesController.remove);

// User management
// Superadmin creates admins
router.post('/admin', authenticate, authorize(['superadmin']), authController.createAdmin);

// Admins (and superadmin) create polling agents
router.post('/polling_agent', authenticate, authorize(['admin','superadmin']), authController.createPollingAgent);

// Admins (and superadmin) create voters
router.post('/voters', authenticate, authorize(['admin','superadmin']), authController.createVoter);

module.exports = router;
