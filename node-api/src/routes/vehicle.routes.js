const router = require("express").Router();
const upload = require("../middleware/upload");
const controller = require("../controllers/vehicle.controller");

router.post(
  "/vehicle-log",
  upload.fields([
    { name: "vehicle_image", maxCount: 1 },
    { name: "plate_image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  controller.createLog
);

module.exports = router;