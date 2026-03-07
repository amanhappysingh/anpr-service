const express = require("express");
const upload = require("../middleware/upload");
const { createEvent } = require("../controllers/event.controller");

const router = express.Router();

router.post(
  "/event/create",
  upload.fields([
    { name: "plate_image", maxCount: 1 },
    { name: "vehicle_image", maxCount: 1 },
    { name: "video_file", maxCount: 1 },
  ]),
  createEvent
);

module.exports = router;