const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../modals/admin.model");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Check user
    const result = await Admin.findByEmail(email);

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const admin = result.rows[0];

    // 2️⃣ Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role,   // 🔥 role token me bhi daal diya
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 4️⃣ Send clean response
    return res.status(200).json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};