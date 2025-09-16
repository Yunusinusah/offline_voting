const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

// storage config for uploads
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Public: list and get (authenticated super/admin can see all)
router.get('/', authenticate, authorize(['superadmin']), settingsController.list);
router.get('/:id', authenticate, authorize(['superadmin','admin']), settingsController.get);

// Create/update/delete: only superadmin
router.post('/', authenticate, authorize(['superadmin']), upload.single('logo'), settingsController.create);
router.put('/:id', authenticate, authorize(['superadmin']), upload.single('logo'), settingsController.update);
router.delete('/:id', authenticate, authorize(['superadmin']), settingsController.remove);

module.exports = router;
