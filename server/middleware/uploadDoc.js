const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({ secure: true });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'demarcheur/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'auto',
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
