// scripts/createAdmin.js

const bcrypt = require("bcrypt");
const Admin = require("../src/modals/admin.model");

(async () => {
  const passwordHash = await bcrypt.hash("admin123", 10);
  console.log(passwordHash)


  console.log("Admin Created");
  process.exit();
})();