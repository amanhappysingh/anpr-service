// controllers/dashboard.controller.js

const dashboardService = require("../services/dashboard.service");

exports.getDashboardData = async (req, res) => {
  try {

    const data = await dashboardService.getDashboardData();

    res.json({
      success: true,
      data
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard"
    });

  }
};