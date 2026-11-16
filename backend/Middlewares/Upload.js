const multer = require('multer');
const { AppError } = require('../utils/AppError');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const imageFilter = (req, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new AppError(400, 'Please upload a JPG, PNG or WebP image.', 'INVALID_IMAGE'));
    }
    cb(null, true);
};

// Files stay in memory and are re-encoded by sharp before anything is saved:
// every image is then stored privately in MongoDB and served through signed URLs.
const makeUpload = (maxBytes) => multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFilter,
    limits: { fileSize: maxBytes, files: 1, fields: 10 },
});

const profileImageUpload = makeUpload(2 * 1024 * 1024).single('profileImage');
const roomImageUpload = makeUpload(10 * 1024 * 1024).single('image');

module.exports = { profileImageUpload, roomImageUpload };
