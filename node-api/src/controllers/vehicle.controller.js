const pool = require("../db");
const ExcelJS = require("exceljs");

exports.saveVehicleText = async (req, res) => {

  try {

    const eventId = req.params.id;

    const {
      vehicle_type,
      direction,
      camera_id,
      is_authorized,
      authenticated
    } = req.body;

    const query = `
      INSERT INTO vehicle_events
      (event_id, vehicle_type, direction, camera_id, is_authorized, authenticated)
      VALUES ($1,$2,$3,$4,$5,$6)

      ON CONFLICT (event_id)
      DO UPDATE SET
        vehicle_type = EXCLUDED.vehicle_type,
        direction = EXCLUDED.direction,
        camera_id = EXCLUDED.camera_id,
        is_authorized = EXCLUDED.is_authorized,
        authenticated = EXCLUDED.authenticated,
        updated_at = NOW()

      RETURNING *
    `;

    const values = [
      eventId,
      vehicle_type,
      direction,
      camera_id,
      is_authorized,
      authenticated
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};

exports.saveVehicleFiles = async (req, res) => {

  try {

    const eventId = req.params.id;

    let updateFields = [];
    let values = [];
    let index = 1;

    if (req.files.vehicle_image) {

      updateFields.push(`image_url=$${index++}`);
      values.push(req.files.vehicle_image[0].path);

    }

    if (req.files.plate_image) {

      updateFields.push(`plate_image_url=$${index++}`);
      values.push(req.files.plate_image[0].path);

    }

    if (req.files.video) {

      updateFields.push(`video_url=$${index++}`);
      values.push(req.files.video[0].path);

    }

    values.push(eventId);

    const query = `
      UPDATE vehicle_events
      SET ${updateFields.join(",")},
          updated_at = NOW()
      WHERE event_id=$${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};


exports.getVehicleReport = async (req, res) => {

  try {

    const { start_date, end_date, camera_id, direction } = req.query;

    let query = `
      SELECT 
        event_id,
        vehicle_type,
        direction,
        camera_id,
        image_url,
        plate_image_url,
        video_url,
        is_authorized,
        authenticated,
        created_at
      FROM vehicle_events
      WHERE created_at BETWEEN $1 AND $2
    `;

    let values = [start_date, end_date];

    if (camera_id) {
      values.push(camera_id);
      query += ` AND camera_id=$${values.length}`;
    }

    if (direction) {
      values.push(direction);
      query += ` AND direction=$${values.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};


exports.downloadVehicleReport = async (req, res) => {

  try {

    const { start_date, end_date } = req.query;

    const result = await pool.query(
      `SELECT 
        event_id,
        vehicle_type,
        direction,
        camera_id,
        image_url,
        plate_image_url,
        is_authorized,
        authenticated,
        created_at
       FROM vehicle_events
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at DESC`,
      [start_date, end_date]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Vehicle Report");

    sheet.columns = [

      { header: "Event ID", key: "event_id", width: 25 },
      { header: "Vehicle Type", key: "vehicle_type", width: 15 },
      { header: "Direction", key: "direction", width: 10 },
      { header: "Camera", key: "camera_id", width: 15 },
      { header: "Vehicle Image", key: "image_url", width: 40 },
      { header: "Plate Image", key: "plate_image_url", width: 40 },
      { header: "Authorized", key: "is_authorized", width: 12 },
      { header: "Authenticated", key: "authenticated", width: 12 },
      { header: "Time", key: "created_at", width: 20 }

    ];

    result.rows.forEach(row => {
      sheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=vehicle_report.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};

exports.getVehicleLogs = async (req, res) => {

  try {

    let { page = 1, limit = 20, camera_id, direction } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        event_id,
        vehicle_type,
        direction,
        camera_id,
        image_url,
        plate_image_url,
        video_url,
        is_authorized,
        authenticated,
        ocr_status,
        created_at
      FROM vehicle_events
      WHERE 1=1
    `;

    let values = [];

    if (camera_id) {
      values.push(camera_id);
      query += ` AND camera_id=$${values.length}`;
    }

    if (direction) {
      values.push(direction);
      query += ` AND direction=$${values.length}`;
    }

    values.push(limit);
    query += ` ORDER BY created_at DESC LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      count: result.rows.length,
      data: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};