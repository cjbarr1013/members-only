const multer = require('multer');

const storage = multer.memoryStorage();
const parseImageFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('pic');

module.exports = parseImageFile;
