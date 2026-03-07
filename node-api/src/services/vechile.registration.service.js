const pool = require("../db");

exports.registerVehicle = async ({ plate_number, vehicle_type }) => {
  const result = await pool.query(
    `INSERT INTO registered_vehicles 
     (plate_number, vehicle_type)
     VALUES ($1, $2)
     RETURNING *`,
    [plate_number.toUpperCase().trim(), vehicle_type]
  );

  return result.rows[0];
};

exports.getAllRegisterVechiles = async () => {
    const result = await pool.query(`SELECT * FROM registered_vehicles WHERE is_active = True ORDER BY created_at DESC`)

    return result.rows
}


exports.updateVehicle = async (id, data) => {
  const { vehicle_type, is_active } = data;

  const result = await pool.query(
    `UPDATE registered_vehicles
     SET vehicle_type = COALESCE($1, vehicle_type),
         is_active = COALESCE($2, is_active)
     WHERE id = $3
     RETURNING *`,
    [vehicle_type || null, is_active, id]
  );

  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};


// ✅ Soft Delete Vehicle
exports.deleteVehicle = async (id) => {
  const result = await pool.query(
    `UPDATE registered_vehicles
     SET is_active = FALSE
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};

exports.bulkInsertVehicles = async (vehicles) => {
  const client = await pool.connect();

  let inserted = 0;
  let skipped = 0;

  try {
    await client.query("BEGIN");

    for (const v of vehicles) {
      const result = await client.query(
        `INSERT INTO registered_vehicles
         (plate_number, vehicle_type)
         VALUES ($1, $2)
         ON CONFLICT (plate_number) DO NOTHING
         RETURNING id`,
        [v.plate_number.toUpperCase().trim(), v.vehicle_type]
      );

      if (result.rowCount > 0) {
        inserted++;
      } else {
        skipped++; // duplicate
      }
    }

    await client.query("COMMIT");

    return { inserted, skipped };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};