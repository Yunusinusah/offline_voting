const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const voterController = require('../controllers/voterController');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Upload voters CSV - admin or polling agent
router.post('/upload', authenticate, authorize(['admin','polling_agent','superadmin']), upload.single('file'), voterController.upload);

module.exports = router;
