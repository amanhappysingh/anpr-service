

const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get("/dashboard", dashboardController.getDashboardData);

module.exports = router;