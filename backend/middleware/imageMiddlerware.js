const multer = require("multer");

const MIMETYPE = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
};
const storage = new multer.diskStorage({
  destination: (req, file, cb) => {
    let err = MIMETYPE[file.mimetype] ? null : new Error("invalid mimetype");
    cb(err, "backend/images");
  },
  filename: (req, file, cb) => {
    const type = MIMETYPE[file.mimetype];
    let err = type ? null : new Error("invalid mimetype");
    let filename =
      file.originalname.toLowerCase().split(" ").join("-") +
      "-" +
      Date.now() +
      "." +
      type;
    cb(err, filename);
  },
});
module.exports = multer({ storage: storage }).single("image");
