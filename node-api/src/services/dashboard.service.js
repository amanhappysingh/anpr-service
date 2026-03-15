const pool = require("../db");

exports.getDashboardData = async () => {

  const counters = await pool.query(`
    SELECT
      COUNT(*) as tot,

      COUNT(*) FILTER (WHERE direction='IN') as "inC",
      COUNT(*) FILTER (WHERE direction='OUT') as "outC",

      COUNT(*) FILTER (WHERE direction='IN' AND vehicle_type='Car') as "inCar",
      COUNT(*) FILTER (WHERE direction='IN' AND vehicle_type='Truck') as "inTrk",

      COUNT(*) FILTER (WHERE direction='OUT' AND vehicle_type='Car') as "outCar",
      COUNT(*) FILTER (WHERE direction='OUT' AND vehicle_type='Truck') as "outTrk",

      COUNT(*) FILTER (WHERE is_authorized=true) as auth,
      COUNT(*) FILTER (WHERE is_authorized=false) as unauth

    FROM vehicle_logs
  `);

  const registered = await pool.query(`
    SELECT COUNT(*) FROM registered_vehicles
  `);

  const recent = await pool.query(`
    SELECT
      event_id as id,
      plate_number as plate,
      vehicle_type as vtype,
      direction as dir,

      CASE
        WHEN is_authorized=true THEN 'Authorised'
        ELSE 'Unauthorised'
      END as status,

      TO_CHAR(created_at,'HH12:MI:SS AM') as time

    FROM vehicle_logs
    ORDER BY created_at DESC
    LIMIT 200
  `);

  const weekly = await pool.query(`
    SELECT
      TO_CHAR(created_at,'Dy') as d,

      COUNT(*) FILTER (WHERE vehicle_type='Car') as c,
      COUNT(*) FILTER (WHERE vehicle_type='Truck') as t

    FROM vehicle_logs
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY d
  `);

  return {
    counters: {
      ...counters.rows[0],
      reg: Number(registered.rows[0].count),
      acc: 98.5
    },
    detections: recent.rows,
    weekly: weekly.rows
  };
};