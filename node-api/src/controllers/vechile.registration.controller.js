const registrationService = require("../services/vechile.registration.service");


// REGISTER VEHICLE
exports.registerVehicle = async (req, res) => {
  try {

    const {
      plateNumber,
      vehicleType,
      driverName,
      area,
      contact
    } = req.body;

    const vehicle = await registrationService.registerVehicle({
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      driver_name: driverName,
      area: area,
      contact: contact
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


// GET ALL VEHICLES
exports.getAllRegisterVehicles = async (req, res) => {
  try {

    const vehicles = await registrationService.getAllRegisterVechiles();

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      plateNumber,
      vehicleType,
      driverName,
      area,
      contact
    } = req.body;

    const updated = await registrationService.updateVehicle(id, {
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      driver_name: driverName,
      area: area,
      contact: contact
    });

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


// DELETE VEHICLE
exports.deleteVehicle = async (req, res) => {
  try {

    const { id } = req.params;

    const deleted = await registrationService.deleteVehicle(id);

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deleted,
    });

  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// BULK UPLOAD
exports.bulkUploadVehicles = async (req, res) => {
  try {

    const { vehicles } = req.body;

    if (!vehicles || !Array.isArray(vehicles)) {
      return res.status(400).json({
        success: false,
        message: "Invalid data"
      });
    }

    const formattedVehicles = vehicles.map(v => ({
      plate_number: v.plateNumber,
      vehicle_type: v.vehicleType,
      driver_name: v.driverName,
      area: v.area,
      contact: v.contact
    }));

    const result = await registrationService.bulkInsertVehicles(formattedVehicles);

    res.json({
      success: true,
      total: vehicles.length,
      inserted: result.inserted,
      skipped: result.skipped,
      message: `${result.inserted} inserted, ${result.skipped} skipped (duplicates)`
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Bulk insert failed",
    });

  }
};