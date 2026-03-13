// services/dashboard.service.js

const pool = require("../db");

exports.getDashboardData = async () => {

  // TOTAL VEHICLES TODAY
  const vehiclesToday = await pool.query(`
    SELECT COUNT(DISTINCT plate_number)
    FROM vehicle_logs
    WHERE DATE(created_at) = CURRENT_DATE
  `);

  // TOTAL PLATES
  const totalPlates = await pool.query(`
    SELECT COUNT(*) FROM vehicle_logs
    WHERE DATE(created_at) = CURRENT_DATE
  `);

  // AUTHORISED
  const authorised = await pool.query(`
    SELECT COUNT(*)
    FROM vehicle_logs
    WHERE status = 'Authorised'
    AND DATE(created_at) = CURRENT_DATE
  `);

  // UNAUTHORISED
  const unauthorised = await pool.query(`
    SELECT COUNT(*)
    FROM vehicle_logs
    WHERE status = 'Unauthorised'
    AND DATE(created_at) = CURRENT_DATE
  `);

  // REGISTERED VEHICLES
  const registered = await pool.query(`
    SELECT COUNT(*)
    FROM registered_vehicles
    WHERE is_active = TRUE
  `);

  // LAST 7 DAYS TREND
  const last7Days = await pool.query(`
    SELECT 
      TO_CHAR(created_at, 'Dy') as day,
      COUNT(*) FILTER (WHERE vehicle_type='Car') as car,
      COUNT(*) FILTER (WHERE vehicle_type='Bus') as bus,
      COUNT(*) FILTER (WHERE vehicle_type='Truck') as truck
    FROM vehicle_logs
    WHERE created_at >= NOW() - INTERVAL '7 days'
    GROUP BY day
  `);

  // VEHICLE DISTRIBUTION
  const distribution = await pool.query(`
    SELECT 
      vehicle_type as type,
      COUNT(*) as count
    FROM vehicle_logs
    GROUP BY vehicle_type
  `);

  // RECENT DETECTIONS
  const recent = await pool.query(`
    SELECT
      id,
      plate_number,
      vehicle_type,
      camera_id,
      status,
      confidence,
      direction,
      created_at
    FROM vehicle_logs
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return {
    todayData: {
      totalVehicles: Number(vehiclesToday.rows[0].count),
      totalPlates: Number(totalPlates.rows[0].count),
      totalDetected: Number(vehiclesToday.rows[0].count),
      authorised: Number(authorised.rows[0].count),
      unauthorised: Number(unauthorised.rows[0].count),
      registered: Number(registered.rows[0].count),
      accuracy: 98.5
    },

    last7DaysData: last7Days.rows,

    vehicleClassification: distribution.rows,

    recentDetections: recent.rows,

    systemStatus: {
      cameras: { active: 3, total: 3 },
      uptime: "99.8%",
      lastUpdate: "Just now"
    }
  };
};