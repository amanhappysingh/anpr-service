const dashboardService = require("../services/dashboard.service");

exports.getDashboardData = async (req, res) => {

  try {

    const data = await dashboardService.getDashboardData();

    res.json({
      success: true,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success:false,
      message:"Dashboard load failed"
    });

  }

};