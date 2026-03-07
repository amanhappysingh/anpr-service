const pool = require("../db");

exports.createVehicle = async (data) => {
  const { plate_number, vehicle_type, direction, camera_id } = data;

  return await pool.query(
    `INSERT INTO vehicles 
     (plate_number, vehicle_type, direction, camera_id)
     VALUES ($1,$2,$3,$4)`,
    [plate_number, vehicle_type, direction, camera_id]
  );
};

exports.getAllVehicles = async () => {
  return await pool.query(
    "SELECT * FROM vehicles ORDER BY created_at DESC"
  );
};

exports.getVehiclesByDays = async (days) => {
  return await pool.query(
    `SELECT * FROM vehicles 
     WHERE created_at >= NOW() - INTERVAL '${days} days'
     ORDER BY created_at DESC`
  );
};