import multer from "multer";
import path from "path";

// Set up storage with destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/"); // <-- ensure this folder exists!
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname); // use original file name
  },
});

// Upload middleware
const upload = multer({ storage });

export default upload;
