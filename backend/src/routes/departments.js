const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');
const { orm } = db;
const models = orm ? orm.models : null;

const router = express.Router();

// simple storage config
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Create department with customization: name, logo, theme
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    const { name, theme_color } = req.body;
    const logo_path = req.file ? `/public/uploads/${req.file.filename}` : null;
  if (!models) throw new Error('ORM not initialized');
  const d = await models.Department.create({ name, logo_path, theme_color });
  res.status(201).json(d.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'failed to create department', details: err.message });
  }
});

// Get department
router.get('/:id', async (req, res) => {
  try {
  if (!models) throw new Error('ORM not initialized');
  const dept = await models.Department.findByPk(req.params.id);
  if (!dept) return res.status(404).json({ error: 'not found' });
  res.json(dept.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
