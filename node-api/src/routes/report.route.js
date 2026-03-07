const express = require("express");
const reportController = require("../controllers/report.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/report/daily",authMiddleware , reportController.getReportByDate);
router.get(
  "/report/download",
  authMiddleware,
  reportController.downloadReport
);

module.exports = router;