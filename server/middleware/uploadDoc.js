const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({ secure: true });

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'demarcheur/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: 'raw',
    access_mode: 'public',
  }),
});

module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
