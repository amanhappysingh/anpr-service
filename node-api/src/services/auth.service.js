const pool = require("../db");

exports.findUserByUsername = async (username) => {
  return await pool.query(
    "SELECT * FROM admin_users WHERE username = $1",
    [username]
  );
};