const ExcelJS = require("exceljs");
const pool = require("../db");

// 🔥 Common dynamic function
exports.generateReportByRange = async (startDate, endDate) => {
  const result = await pool.query(
    `
    SELECT * FROM vehicles
    WHERE created_at >= $1
    AND created_at < $2
    ORDER BY created_at DESC
    `,
    [startDate, endDate]
  );

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vehicle Report");

  sheet.columns = [
    { header: "Plate", key: "plate_number", width: 20 },
    { header: "Type", key: "vehicle_type", width: 15 },
    { header: "Direction", key: "direction", width: 15 },
    { header: "Camera", key: "camera_id", width: 15 },
    { header: "Time", key: "created_at", width: 25 },
  ];

  sheet.addRows(result.rows);

  return await workbook.xlsx.writeBuffer();
};

exports.generateCronReport = async () => {
  const now = new Date();

  const end = new Date(now);
  end.setHours(18, 0, 0, 0); // Today 6 PM

  const start = new Date(end);
  start.setDate(start.getDate() - 1); // Previous day 6 PM

  return await exports.generateReportByRange(start, end);
};