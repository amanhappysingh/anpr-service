const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseDir = path.join(__dirname, "..", "uploads");

const folders = {
  vehicle_image: path.join(baseDir, "vehicles"),
  plate_image: path.join(baseDir, "plates"),
  video: path.join(baseDir, "videos")
};

// ensure folders exist
Object.values(folders).forEach(folder => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
});

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    if (file.fieldname === "vehicle_image") {
      cb(null, folders.vehicle_image);
    }
    else if (file.fieldname === "plate_image") {
      cb(null, folders.plate_image);
    }
    else if (file.fieldname === "video") {
      cb(null, folders.video);
    }
    else {
      cb(null, baseDir);
    }

  },

  filename: function (req, file, cb) {

    const id = req.params.id;  // plateNo_timestamp
    const ext = path.extname(file.originalname);

    cb(null, `${id}${ext}`);

  }

});

const upload = multer({ storage });

module.exports = upload;