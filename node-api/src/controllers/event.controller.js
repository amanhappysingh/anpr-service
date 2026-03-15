const pool = require("../db");
const redisClient = require("../db/redis");

exports.createEvent = async (req, res) => {
  try {
    const { event_id, camera_id, direction } = req.body;

    const platePath = req.files?.plate_image?.[0]?.path || null;
    const vehiclePath = req.files?.vehicle_image?.[0]?.path || null;
    const videoPath = req.files?.video_file?.[0]?.path || null;

    await pool.query(
      `INSERT INTO vehicle_logs
       (event_id, camera_id, direction, image_url, plate_image_url, video_url)
       VALUES ($1,$2,$3,$4,$5,$6,'PENDING')`,
      [event_id, camera_id, direction, vehiclePath, platePath, videoPath]
    );

    await redisClient.lPush(
      "ocr_queue",
      JSON.stringify({
        event_id,
        plate_image_path: platePath,
      })
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to create event" });
  }
};