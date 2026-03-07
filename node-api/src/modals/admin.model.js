const pool = require("../db");

class Admin {

  static async findByEmail(email) {
    return await pool.query(
      "SELECT * FROM admin_users WHERE email = $1",
      [email]
    );
  }

  static async create(email, passwordHash) {
    return await pool.query(
      `INSERT INTO admin_users (email, password)
       VALUES ($1, $2)
       RETURNING *`,
      [email, passwordHash]
    );
  }

}

module.exports = Admin;