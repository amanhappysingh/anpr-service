const express = require("express");
const router = express.Router();
const controller = require("../controllers/vechile.registration.controller");


router.get("/", controller.getAllRegisterVehicles);
router.patch("/:id", controller.updateVehicle);
router.delete("/:id", controller.deleteVehicle);
router.post("/register", controller.registerVehicle);
router.post("/bulk", controller.bulkUploadVehicles);


module.exports = router;