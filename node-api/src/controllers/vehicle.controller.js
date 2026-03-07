const VehicleLog = require("../modals/vehicle.model");

exports.createLog = async (req, res) => {

  try {

    const {
      plate_number,
      camera_id,
      vehicle_type,
      status
    } = req.body;

    const vehicleImage = req.files["vehicle_image"]?.[0]?.filename;
    const plateImage = req.files["plate_image"]?.[0]?.filename;
    const video = req.files["video"]?.[0]?.filename;

    const result = await VehicleLog.create({
      plate_number,
      camera_id,
      vehicle_type,
      status,
      vehicle_image: vehicleImage,
      plate_image: plateImage,
      video
    });

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to save vehicle log",
      error: error.message
    });

  }

};