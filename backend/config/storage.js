const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, '../uploads/audio'));
    } else if (file.fieldname === 'cover') {
      cb(null, path.join(__dirname, '../uploads/covers'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
  const allowedImages = ['image/jpeg', 'image/png'];
  const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'image/jpeg', 'image/png'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 2
  }
});

module.exports = upload;

const uploadAudio = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1
  }
}).single('audio');

const uploadCover = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1
  }
}).single('cover');

module.exports.uploadAudio = uploadAudio;
module.exports.uploadCover = uploadCover;