const express = require("express");
const emailController = require("../controllers/email.controller");
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router();

router.post("/emails",authMiddleware , emailController.addEmail);
router.get("/emails",authMiddleware , emailController.getAllEmails);

router.delete("/emails/:id",authMiddleware , emailController.deleteEmail);

module.exports = router;