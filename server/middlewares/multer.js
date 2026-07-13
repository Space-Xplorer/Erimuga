import multer from "multer";
import path from "path";
import crypto from "crypto";

// Set up storage with destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/"); // <-- ensure this folder exists!
  },
  filename: function (req, file, callback) {
    // UUID-prefixed to avoid collisions and path-traversal via crafted originalname
    const ext = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${ext}`);
  },
});

// File type and size restrictions
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export default upload;
