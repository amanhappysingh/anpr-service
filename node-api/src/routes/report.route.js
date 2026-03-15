const express = require("express");
const vechileController = require("../controllers/vehicle.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/report/daily",authMiddleware , vechileController.getVehicleReport);
router.get(
  "/report/download",
  authMiddleware,
  vechileController.downloadVehicleReport
);

module.exports = router;