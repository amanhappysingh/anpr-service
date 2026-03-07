const pool = require("../db");

class EmailRecipient {

  static async create(email) {
    return pool.query(
      "INSERT INTO email_recipients (email) VALUES ($1) RETURNING *",
      [email]
    );
  }

  static async findAll() {
    return pool.query(
      "SELECT * FROM email_recipients ORDER BY created_at DESC"
    );
  }

  static async delete(id) {
    return pool.query(
      "DELETE FROM email_recipients WHERE id = $1",
      [id]
    );
  }

}

module.exports = EmailRecipient;