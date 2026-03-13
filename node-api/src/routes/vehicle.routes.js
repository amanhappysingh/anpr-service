const router = require("express").Router();
const upload = require("../middleware/upload");
const controller = require("../controllers/vehicle.controller");

// text data save
router.post(
  "/vehicle-data/:id/text",
  controller.saveVehicleText
);

// files upload
router.post(
  "/vehicle-data/:id/file",
  upload.fields([
    { name: "vehicle_image", maxCount: 1 },
    { name: "plate_image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  controller.saveVehicleFiles
);

router.get("/vehicle-report", controller.getVehicleReport);

router.get("/vehicle-logs", controller.getVehicleLogs);

router.get("/vehicle-report/download", controller.downloadVehicleReport);

module.exports = router;