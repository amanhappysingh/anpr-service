const reportService = require("../services/report.service");

// exports.getReportByDate = async (req, res) => {
//   try {

//     const { startDate, endDate } = req.query;

//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message: "startDate and endDate required"
//       });
//     }

//     const result = await reportService.getReportData(
//       new Date(startDate),
//       new Date(endDate)
//     );

//     res.json({
//       success: true,
//       total: result.total,
//       showing: result.data.length,
//       data: result.data
//     });

//   } catch (err) {

//     console.error(err);

//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch report"
//     });

//   }
// };


exports.downloadReport = async (req, res) => {
  try {

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate required"
      });
    }

    const buffer = await reportService.generateReportByRange(
      new Date(startDate),
      new Date(endDate)
    );

    const fileName = `vehicle_report_${startDate}_to_${endDate}.xlsx`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Report download failed"
    });

  }
};

