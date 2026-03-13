const pool = require("../db");


// REGISTER VEHICLE
exports.registerVehicle = async ({
  plate_number,
  vehicle_type,
  driver_name,
  area,
  contact
}) => {

  const result = await pool.query(
    `INSERT INTO registered_vehicles 
     (plate_number, vehicle_type, driver_name, area, contact)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      plate_number.toUpperCase().trim(),
      vehicle_type,
      driver_name,
      area,
      contact
    ]
  );

  return result.rows[0];
};



// GET ALL VEHICLES
exports.getAllRegisterVechiles = async () => {

  const result = await pool.query(
    `SELECT *
     FROM registered_vehicles
     WHERE is_active = TRUE
     ORDER BY created_at DESC`
  );

  return result.rows;
};



// UPDATE VEHICLE
exports.updateVehicle = async (id, data) => {

  const {
    vehicle_type,
    driver_name,
    area,
    contact,
    is_active
  } = data;

  const result = await pool.query(
    `UPDATE registered_vehicles
     SET
       vehicle_type = COALESCE($1, vehicle_type),
       driver_name = COALESCE($2, driver_name),
       area = COALESCE($3, area),
       contact = COALESCE($4, contact),
       is_active = COALESCE($5, is_active)
     WHERE id = $6
     RETURNING *`,
    [
      vehicle_type || null,
      driver_name || null,
      area || null,
      contact || null,
      is_active,
      id
    ]
  );

  if (result.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  return result.rows[0];
};



// SOFT DELETE VEHICLE
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



// BULK INSERT VEHICLES
exports.bulkInsertVehicles = async (vehicles) => {

  const client = await pool.connect();

  let inserted = 0;
  let skipped = 0;

  try {

    await client.query("BEGIN");

    for (const v of vehicles) {

      const result = await client.query(
        `INSERT INTO registered_vehicles
         (plate_number, vehicle_type, driver_name, area, contact)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (plate_number) DO NOTHING
         RETURNING id`,
        [
          v.plate_number.toUpperCase().trim(),
          v.vehicle_type,
          v.driver_name,
          v.area,
          v.contact
        ]
      );

      if (result.rowCount > 0) {
        inserted++;
      } else {
        skipped++;
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