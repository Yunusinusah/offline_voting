const express = require('express');
const multer = require('multer');
const path = require('path');

const { authenticate, authorize } = require("../middleware/auth");
const electionsController = require("../controllers/electionsController");
const portfoliosController = require("../controllers/portfoliosController");
const candidatesController = require("../controllers/candidatesController");
const authController = require("../controllers/authController");

const resultsController = require("../controllers/resultsController");

const router = express.Router();

const uploadDir =
  process.env.UPLOAD_DIR || path.join(__dirname, "..", "public", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

/*****************SUPER ADMIN **********************/
//Election management
router.post(
  "/elections",
  authenticate,
  authorize(["superadmin"]),
  electionsController.create
);
router.get(
  "/elections",
  authenticate,
  authorize(["superadmin"]),
  electionsController.list
);
router.get(
  "/elections/me",
  authenticate,
  authorize(["admin"]),
  electionsController.myElection
);
router.put(
  "/elections/end_time",
  authenticate,
  authorize(["admin"]),
  electionsController.adjustEndTime
);
router.put(
  "/elections/:id",
  authenticate,
  authorize(["superadmin"]),
  electionsController.update
);
router.delete(
  "/elections/:id",
  authenticate,
  authorize(["superadmin"]),
  electionsController.remove
);

// User management
router.post(
  "/admin",
  authenticate,
  authorize(["superadmin"]),
  authController.createAdmin
);
router.get(
  "/admin",
  authenticate,
  authorize(["superadmin"]),
  authController.getAdmins
);
router.put(
  "/admin/:id",
  authenticate,
  authorize(["superadmin"]),
  authController.updateAdmin
);
router.delete(
  "/admin/:id",
  authenticate,
  authorize(["superadmin"]),
  authController.deleteAdmin
);

/*************** ADMIN  **********************/
// Portfolio
router.get(
  "/portfolios",
  authenticate,
  authorize(["admin"]),
  portfoliosController.list
);
router.post(
  "/portfolios",
  authenticate,
  authorize(["admin"]),
  portfoliosController.create
);
router.put(
  "/portfolios/:id",
  authenticate,
  authorize(["admin"]),
  portfoliosController.update
);
router.delete(
  "/portfolios/:id",
  authenticate,
  authorize(["admin"]),
  portfoliosController.remove
);

// Candidates
router.post(
  "/candidates",
  authenticate,
  authorize(["admin"]),
  upload.single("profile_picture"),
  candidatesController.create
);
router.put(
  "/candidates/:id",
  authenticate,
  authorize(["admin"]),
  upload.single("profile_picture"),
  candidatesController.update
);
router.delete(
  "/candidates/:id",
  authenticate,
  authorize(["admin"]),
  candidatesController.remove
);

// polling agents
router.post(
  "/polling_agent",
  authenticate,
  authorize(["admin"]),
  authController.createPollingAgent
);
router.get(
  "/polling_agent",
  authenticate,
  authorize(["admin"]),
  authController.getAgents
);
router.delete(
  "/polling_agent/:id",
  authenticate,
  authorize(["admin"]),
  authController.deleteAgent
);

// Admins create voters
router.post(
  "/voters",
  authenticate,
  authorize(["admin"]),
  authController.createVoter
);
// Admin list voters (paginated, searchable)
router.get(
  "/voters",
  authenticate,
  authorize(["admin"]),
  authController.getVoters
);

// Results and Monitoring
router.get(
  "/results/",
  authenticate,
  authorize(["admin"]),
  resultsController.electionResults
);
router.get(
  "/monitor/",
  authenticate,
  authorize(["admin"]),
  resultsController.monitor
);


module.exports = router;
