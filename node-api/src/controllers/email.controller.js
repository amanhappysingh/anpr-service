const EmailRecipient = require("../modals/emailRecipient.model");
const { sendWelcomeMail } = require("../services/email.service");

// ADD EMAILS
exports.addEmail = async (req, res) => {
  try {
    const { emails } = req.body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        message: "Emails array required",
      });
    }

    const inserted = [];
    const duplicates = [];

    for (const email of emails) {
      try {
        const result = await EmailRecipient.create(email);
        inserted.push(result.rows[0]);

        await sendWelcomeMail(email);
      } catch (err) {
        if (err.code === "23505") {
          duplicates.push(email);
        } else {
          throw err;
        }
      }
    }

    if (inserted.length === 0 && duplicates.length > 0) {
      return res.status(409).json({
        message: "All emails already exist",
        duplicates,
      });
    }

    return res.status(201).json({
      success: true,
      inserted,
      duplicates,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


// GET ALL EMAILS
exports.getAllEmails = async (req, res) => {
  try {

    const result = await EmailRecipient.findAll();

    return res.status(200).json({
      success: true,
      emails: result.rows
    });

  } catch (error) {

    return res.status(500).json({
      message: "Failed to fetch emails",
      error: error.message
    });

  }
};


// DELETE EMAIL
exports.deleteEmail = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await EmailRecipient.delete(id);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Email not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Failed to delete email",
      error: error.message
    });

  }
};