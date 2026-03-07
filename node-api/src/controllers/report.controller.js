const reportService = require("../services/report.service");

exports.getReportByDate = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "start_date and end_date required",
      });
    }

    const buffer = await reportService.generateReportByRange(
      new Date(start_date),
      new Date(end_date)
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Report generation failed" });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: "start_date and end_date required",
      });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);

    const buffer = await reportService.generateReportByRange(start, end);

    const fileName = `report_${start_date}_to_${end_date}.xlsx`;

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
    res.status(500).json({ message: "Report download failed" });
  }
};