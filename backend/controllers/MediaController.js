const { AppError } = require('../utils/AppError');
const storage = require('../utils/storage');

// GET /media/:file?exp=&sig=
// Serves a stored image only for a valid, unexpired signature. No auth header is
// needed because <img> tags can't send one; the signed URL is the permission.
const serveMedia = async (req, res, next) => {
    try {
        const { file } = req.params;
        const { exp, sig } = req.query;

        if (!storage.verifySignature(file, exp, sig)) {
            throw new AppError(403, 'This link is invalid or has expired.', 'FORBIDDEN');
        }
        const stored = await storage.findFile(file);
        if (!stored) {
            throw new AppError(404, 'Image not found.', 'NOT_FOUND');
        }

        res.set({
            'Content-Type': stored.contentType || storage.contentTypeFor(file),
            'Content-Length': String(stored.data.length),
            'Cache-Control': 'private, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
        });
        res.end(stored.data);
    } catch (error) {
        next(error);
    }
};

module.exports = { serveMedia };
