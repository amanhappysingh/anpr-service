const pool = require("../db");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const { broadcastImage, getIO } = require("../websocket");


// ─────────────────────────────────────────────
// SAVE VEHICLE TEXT DATA
// ─────────────────────────────────────────────
exports.saveVehicleText = async (req, res) => {

  try {

    const eventId = req.params.id;

    let {
      vehicle_type,
      direction,
      camera_id,
      plate_number
    } = req.body;

    // NORMALIZE PLATE NUMBER
    const normalizedPlate = plate_number
      ?.replace(/\s+/g, "")
      .toUpperCase();

    // REGISTERED VEHICLE CHECK
    const authCheck = await pool.query(
      `
      SELECT plate_number, vehicle_type
      FROM registered_vehicles
      WHERE REPLACE(UPPER(plate_number),' ','') = $1
      `,
      [normalizedPlate]
    );

    let is_authorized = false;

    if (authCheck.rows.length > 0) {

      is_authorized = true;

      vehicle_type = authCheck.rows[0].vehicle_type;

    }

    const result = await pool.query(
      `
      INSERT INTO vehicle_logs
      (event_id, plate_number, vehicle_type, direction, camera_id, is_authorized)

      VALUES ($1,$2,$3,$4,$5,$6)

      ON CONFLICT(event_id)
      DO UPDATE SET
        plate_number = EXCLUDED.plate_number,
        vehicle_type = EXCLUDED.vehicle_type,
        direction = EXCLUDED.direction,
        camera_id = EXCLUDED.camera_id,
        is_authorized = EXCLUDED.is_authorized,
        updated_at = NOW()

      RETURNING *
      `,
      [
        eventId,
        normalizedPlate,
        vehicle_type,
        direction,
        camera_id,
        is_authorized
      ]
    );

    const vehicle = result.rows[0];

    const time = new Date(vehicle.created_at || Date.now())
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });

    const io = getIO();

    io.emit("vehicle-detected", {
      id: vehicle.event_id,
      plate: vehicle.plate_number,
      vtype: vehicle.vehicle_type,
      dir: vehicle.direction,
      status: vehicle.is_authorized ? "Authorised" : "Unauthorised",
      time
    });

    res.json({
      success: true,
      data: vehicle
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

};



 // ─────────────────────────────────────────────
 // SAVE VEHICLE FILES (IMAGE / VIDEO)
 // ─────────────────────────────────────────────
exports.saveVehicleFiles = async (req,res)=>{

  try{

    const eventId=req.params.id;

    let updateFields=[];
    let values=[];
    let index=1;

    let imageUrl=null;

    if(req.files?.vehicle_image){

      imageUrl=req.files.vehicle_image[0].path;

      updateFields.push(`image_url=$${index++}`);
      values.push(imageUrl);

    }

    if(req.files?.plate_image){

      updateFields.push(`plate_image_url=$${index++}`);
      values.push(req.files.plate_image[0].path);

    }

    if(req.files?.video){

      updateFields.push(`video_url=$${index++}`);
      values.push(req.files.video[0].path);

    }

    if(updateFields.length===0){

      return res.status(400).json({
        success:false,
        message:"No files uploaded"
      });

    }

    values.push(eventId);

    const query=`
      UPDATE vehicle_logs
      SET ${updateFields.join(",")},
      updated_at=NOW()
      WHERE event_id=$${index}
      RETURNING *
    `;

    const result=await pool.query(query,values);
    const vehicle=result.rows[0];

    // IMAGE WEBSOCKET
    if(imageUrl && vehicle){

      broadcastImage({
        id:vehicle.event_id,
        plate_no:vehicle.plate_number,
        url:imageUrl,
        time:vehicle.created_at
      });

    }

    res.json({
      success:true,
      data:vehicle
    });

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

};



 // ─────────────────────────────────────────────
 // VEHICLE REPORT API
 // ─────────────────────────────────────────────

exports.getVehicleReport = async (req, res) => {
  try {

    const { startDate, endDate, camera_id, direction } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate required"
      });
    }

    // ===== BASE QUERY =====
    let baseQuery = `
      FROM vehicle_logs
      WHERE created_at >= $1 AND created_at <= $2
    `;

    let values = [startDate, endDate];

    if (camera_id) {
      values.push(camera_id);
      baseQuery += ` AND camera_id = $${values.length}`;
    }

    if (direction) {
      values.push(direction);
      baseQuery += ` AND direction = $${values.length}`;
    }

    // ===== TOTAL COUNT =====
    const totalResult = await pool.query(
      `SELECT COUNT(*) ${baseQuery}`,
      values
    );

    const total = parseInt(totalResult.rows[0].count);

    // ===== DATA QUERY (LIMIT 100) =====
    const dataResult = await pool.query(
      `
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
      ${baseQuery}
      ORDER BY created_at DESC
      LIMIT 100
      `,
      values
    );

    res.json({
      success: true,
      total: total,
      showing: dataResult.rows.length,
      data: dataResult.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }
};



 // ─────────────────────────────────────────────
 // PAGINATED VEHICLE LOGS
 // ─────────────────────────────────────────────
exports.getVehicleLogs = async (req,res)=>{

  try{

    let {page=1,limit=20,camera_id,direction}=req.query;

    page=Number(page);
    limit=Number(limit);

    const offset=(page-1)*limit;

    let baseQuery=`
      FROM vehicle_logs vl
      LEFT JOIN registered_vehicles rv
      ON vl.plate_number=rv.plate_number
      WHERE 1=1
    `;

    let values=[];

    if(camera_id){

      values.push(camera_id);
      baseQuery+=` AND vl.camera_id=$${values.length}`;

    }

    if(direction){

      values.push(direction);
      baseQuery+=` AND vl.direction=$${values.length}`;

    }

    const countQuery=`SELECT COUNT(*) ${baseQuery}`;
    const countResult=await pool.query(countQuery,values);
    const total=Number(countResult.rows[0].count);

    let dataQuery=`
      SELECT
        vl.event_id,
        vl.plate_number,
        vl.direction,
        vl.camera_id,
        vl.image_url,
        vl.plate_image_url,
        vl.video_url,
        vl.created_at,

        rv.driver_name,
        rv.vehicle_type,

        CASE
          WHEN rv.plate_number IS NOT NULL THEN 'Authorized'
          ELSE 'Unauthorized'
        END AS authorization_status

      ${baseQuery}
      ORDER BY vl.created_at DESC
      LIMIT $${values.length+1}
      OFFSET $${values.length+2}
    `;

    const result=await pool.query(dataQuery,[...values,limit,offset]);

    res.json({

      success:true,
      totalRecords:total,
      totalPages:Math.ceil(total/limit),
      currentPage:page,
      limit,
      count:result.rows.length,
      data:result.rows

    });

  }
  catch(err){

    console.error(err);

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

};



 // ─────────────────────────────────────────────
 // EXCEL REPORT DOWNLOAD
 // ─────────────────────────────────────────────
exports.downloadVehicleReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required"
      });
    }

    const result = await pool.query(
      `
      SELECT 
        event_id,
        plate_number,
        vehicle_type,
        direction,
        camera_id,
        image_url,
        plate_image_url,
        is_authorized,
        authenticated,
        created_at
      FROM vehicle_logs
      WHERE created_at >= $1
      AND created_at < $2::date + interval '1 day'
      ORDER BY created_at DESC
      `,
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

      // ===== VEHICLE IMAGE =====
      if (row.image_url) {
        const imagePath = path.join(
          process.cwd(),
          "uploads",
          "vehicles",
          path.basename(row.image_url)
        );

        if (fs.existsSync(imagePath)) {

          const ext = path.extname(imagePath).replace(".", "") || "jpg";

          const imageId = workbook.addImage({
            filename: imagePath,
            extension: ext
          });

          sheet.addImage(imageId, {
            tl: { col: 5, row: rowIndex - 1 },
            ext: { width: 120, height: 80 }
          });
        }
      }

      // ===== PLATE IMAGE =====
      if (row.plate_image_url) {
        const platePath = path.join(
          process.cwd(),
          "uploads",
          "plates",
          path.basename(row.plate_image_url)
        );

        if (fs.existsSync(platePath)) {

          const ext = path.extname(platePath).replace(".", "") || "jpg";

          const imageId = workbook.addImage({
            filename: platePath,
            extension: ext
          });

          sheet.addImage(imageId, {
            tl: { col: 6, row: rowIndex - 1 },
            ext: { width: 120, height: 80 }
          });
        }
      }

      rowIndex++;
    }

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

// ─────────────────────────────────────────────
// GET LATEST VEHICLE IMAGES
// ─────────────────────────────────────────────
exports.getLatestVehicleImages = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        event_id,
        plate_number,
        image_url,
        plate_image_url,
        created_at
      FROM vehicle_logs
      WHERE image_url IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 20
    `);

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