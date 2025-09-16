const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const voterController = require('../controllers/voterController');
const voteController = require('../controllers/voteController');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Upload voters Excel - admin or polling agent
router.post(
  "/upload",
  authenticate,
  authorize(["admin"]),
  upload.single("file"),
  voterController.upload
);
router.post(
  "/add/single",
  authenticate,
  authorize(["admin", "superadmin"]),
  voterController.addSingle
);

// Get voters list - admin 
router.get(
  "/voters",
  authenticate,
  authorize(["admin"]),
  voterController.list
);

router.delete(
  "/voters/reset",
  authenticate, authorize(["admin"]), voterController.resetAll
);


/********** VOTING ROUTES ***********/
// Show voters ballot data
router.get('/votes', authenticate, authorize(['voter']), voteController.list);

// Cast vote (voter token required)
router.post('/votes', authenticate, authorize(['voter']), voteController.cast);

module.exports = router;
