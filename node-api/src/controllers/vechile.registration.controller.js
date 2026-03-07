const registrationService = require("../services/vechile.registration.service");

exports.registerVehicle = async (req, res) => {
  try {
    const { plate_number, vehicle_type } = req.body;

    const vehicle = await registrationService.registerVehicle({
      plate_number,
      vehicle_type,
    });

    res.status(201).json({
      success: true,
      data: vehicle,
    });

  } catch (error) {

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Vehicle already registered",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
exports.getAllRegisterVehicles = async (req, res) => {
  try {
    const vechile = await registrationService.getAllRegisterVechiles();
    res.status(200).json({
        success : true,
        count : vechile.length,
        data : vechile
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ PATCH
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await registrationService.updateVehicle(id, req.body);

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: updated,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// ✅ DELETE
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await registrationService.deleteVehicle(id);

    res.json({
      success: true,
      message: "Vehicle deactivated successfully",
      data: deleted,
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


exports.bulkUploadVehicles = async (req, res) => {
  try {
    const { vehicles } = req.body;

    if (!vehicles || !Array.isArray(vehicles)) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const result = await registrationService.bulkInsertVehicles(vehicles);

    res.json({
      success: true,
      total: vehicles.length,
      inserted: result.inserted,
      skipped: result.skipped,
      message: `${result.inserted} inserted, ${result.skipped} skipped (duplicates)`,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Bulk insert failed",
    });
  }
};

