const multer = require('multer');
const { AppError } = require('../utils/AppError');

const notFound = (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found', code: 'NOT_FOUND' });
};

// One place that turns any error into { success:false, message, code } without stack traces.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.status).json({ success: false, message: err.message, code: err.code });
    }

    if (err instanceof multer.MulterError) {
        const tooLarge = err.code === 'LIMIT_FILE_SIZE';
        return res.status(400).json({
            success: false,
            message: tooLarge ? 'That image is too large.' : 'Upload failed. Please send one image file.',
            code: tooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
        });
    }

    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON body', code: 'BAD_JSON' });
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({ success: false, message: 'Request body too large', code: 'BODY_TOO_LARGE' });
    }

    // Duplicate key (e.g. two signups racing on the same email).
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'That email is already in use.', code: 'EMAIL_TAKEN' });
    }

    if (err.name === 'CastError') {
        return res.status(404).json({ success: false, message: 'Not found', code: 'NOT_FOUND' });
    }

    console.error('Unexpected error:', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error', code: 'SERVER_ERROR' });
};

module.exports = { notFound, errorHandler };
