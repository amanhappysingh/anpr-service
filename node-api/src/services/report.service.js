// report.service.js
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const pool = require("../db"); // Aapka DB connection

exports.generateCronReport = async () => {
  const now = new Date();
  const end = new Date(now); // Aaj subah 2:10
  const start = new Date(now);
  start.setDate(start.getDate() - 1); // Kal subah 2:10

  return await exports.generateReportByRange(start, end);
};

exports.generateReportByRange = async (startDate, endDate) => {
  const result = await pool.query(
    `SELECT event_id, plate_number, vehicle_type, direction, camera_id, 
            image_url, plate_image_url, is_authorized, created_at
     FROM vehicle_logs
     WHERE created_at >= $1 AND created_at < $2
     ORDER BY created_at DESC`,
    [startDate, endDate]
  );

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vehicle Report");

  sheet.columns = [
    { header: "Event ID", key: "event_id", width: 25 },
    { header: "Plate Number", key: "plate_number", width: 18 },
    { header: "Vehicle Type", key: "vehicle_type", width: 15 },
    { header: "Direction", key: "direction", width: 12 },
    { header: "Vehicle Image", key: "vehicle_image", width: 30 },
    { header: "Plate Image", key: "plate_image", width: 30 },
    { header: "Authorized", key: "is_authorized", width: 15 },
    { header: "Time", key: "created_at", width: 22 }
  ];

  let rowIndex = 2;

  for (const row of result.rows) {
    sheet.addRow({
      event_id: row.event_id,
      plate_number: row.plate_number,
      vehicle_type: row.vehicle_type,
      direction: row.direction,
      vehicle_image: "", 
      plate_image: "",
      is_authorized: row.is_authorized ? "Authorized" : "Unauthorized",
      created_at: row.created_at
    });

    sheet.getRow(rowIndex).height = 80;

    // --- Vehicle Image Logic ---
    if (row.image_url) {
      const imagePath = path.join(process.cwd(), "uploads", "vehicles", path.basename(row.image_url));
      if (fs.existsSync(imagePath)) {
        const ext = path.extname(imagePath).replace(".", "") || "jpg";
        const imageId = workbook.addImage({ filename: imagePath, extension: ext });
        sheet.addImage(imageId, {
          tl: { col: 4, row: rowIndex - 1 }, // Column E
          ext: { width: 120, height: 80 }
        });
      }
    }

    // --- Plate Image Logic ---
    if (row.plate_image_url) {
      const platePath = path.join(process.cwd(), "uploads", "plates", path.basename(row.plate_image_url));
      if (fs.existsSync(platePath)) {
        const ext = path.extname(platePath).replace(".", "") || "jpg";
        const imageId = workbook.addImage({ filename: platePath, extension: ext });
        sheet.addImage(imageId, {
          tl: { col: 5, row: rowIndex - 1 }, // Column F
          ext: { width: 120, height: 80 }
        });
      }
    }
    rowIndex++;
  }

  // File return karne ke bajaye buffer return karenge mail ke liye
  return await workbook.xlsx.writeBuffer();
};