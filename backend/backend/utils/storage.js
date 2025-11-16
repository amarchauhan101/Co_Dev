// utils/storage.js
// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("cloudinary").v2;

// // 🔧 Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "chat-files",
//     allowed_formats: ["jpg", "png", "mp4", "pdf", "docx"],
//   },
// });

// const parser = multer({ storage });
// module.exports = parser;
