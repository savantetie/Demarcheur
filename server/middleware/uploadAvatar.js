const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({ secure: true });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'demarcheur/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB max
});
