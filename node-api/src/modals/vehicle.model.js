const pool = require("../db");

class VehicleLog {

  static async create(data) {
    const query = `
      INSERT INTO vehicle_logs
      (plate_number, vehicle_type, camera_id, image_url, clip_url, status)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `;

    const values = [
      data.plate_number,
      data.vehicle_type,
      data.camera_id,
      data.image_url,
      data.clip_url,
      data.status
    ];

    return pool.query(query, values);
  }

}

module.exports = VehicleLog;