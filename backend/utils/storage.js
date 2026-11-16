// Private image storage for room photos, AI visuals and profile photos.
// Images are stored in MongoDB (the Media collection), so the app also works on
// serverless hosts without a disk. They are only reachable through signed,
// expiring URLs (GET /media/:file?exp=&sig=). Swap these functions for S3 or
// Cloudinary later without touching the controllers.
const crypto = require('crypto');
const path = require('path');
const mediaModel = require('../Models/Media');

const FILE_NAME_RE = /^[a-f0-9-]{36}\.(jpg|webp|png)$/;
const DEFAULT_TTL_SECONDS = 24 * 60 * 60;

const CONTENT_TYPES = { jpg: 'image/jpeg', webp: 'image/webp', png: 'image/png' };

const isValidFileName = (name) => typeof name === 'string' && FILE_NAME_RE.test(name);

const contentTypeFor = (name) => CONTENT_TYPES[path.extname(name).slice(1)] || 'application/octet-stream';

// Saves a buffer under a new random name and returns that name.
// `owner` (a user id) lets us delete everything a user stored in one go.
const saveFile = async (buffer, ext, { owner } = {}) => {
    if (!CONTENT_TYPES[ext]) {
        throw new Error(`Unsupported file type: ${ext}`);
    }
    const name = `${crypto.randomUUID()}.${ext}`;
    await mediaModel.create({
        name,
        contentType: CONTENT_TYPES[ext],
        size: buffer.length,
        data: buffer,
        owner,
    });
    return name;
};

// Returns { data: Buffer, contentType } or null.
const findFile = async (name) => {
    if (!isValidFileName(name)) return null;
    const doc = await mediaModel.findOne({ name }).select('+data');
    if (!doc) return null;
    return { data: Buffer.from(doc.data), contentType: doc.contentType };
};

const readFile = async (name) => {
    const file = await findFile(name);
    if (!file) {
        const error = new Error(`Stored file not found: ${name}`);
        error.code = 'ENOENT';
        throw error;
    }
    return file.data;
};

const fileExists = async (name) => {
    if (!isValidFileName(name)) return false;
    return Boolean(await mediaModel.exists({ name }));
};

// Deleting a missing file is fine (already gone). Old non-storage values are ignored.
const deleteFile = async (name) => {
    if (!isValidFileName(name)) return;
    try {
        await mediaModel.deleteOne({ name });
    } catch (error) {
        console.error('Could not delete stored file:', error.message);
    }
};

// Removes every image a user stored (originals, visuals, profile photos).
const deleteByOwner = async (ownerId) => {
    if (!ownerId) return 0;
    const result = await mediaModel.deleteMany({ owner: ownerId });
    return result.deletedCount || 0;
};

const getSecret = () => {
    const secret = process.env.MEDIA_SECRET || process.env.JWT_SECRET;
    if (!secret) {
        console.error('MEDIA_SECRET and JWT_SECRET are both missing: image links cannot be signed. Set them in the environment.');
        throw new Error('Image signing secret is not configured');
    }
    return secret;
};

const sign = (name, exp) => crypto
    .createHmac('sha256', getSecret())
    .update(`${name}:${exp}`)
    .digest('hex');

// Expiry is rounded up to the next hour, so the same image keeps the same URL
// for an hour and the browser can cache it.
const signUrl = (req, name, ttlSeconds = DEFAULT_TTL_SECONDS) => {
    if (!name) return undefined;
    const now = Math.floor(Date.now() / 1000);
    const exp = Math.ceil(now / 3600) * 3600 + ttlSeconds;
    const sig = sign(name, exp);
    return `${req.protocol}://${req.get('host')}/media/${name}?exp=${exp}&sig=${sig}`;
};

// True only for a well-formed name, a future expiry and a matching signature.
const verifySignature = (name, exp, sig) => {
    if (!isValidFileName(name)) return false;
    if (typeof exp !== 'string' || !/^\d{1,12}$/.test(exp)) return false;
    if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
    if (typeof sig !== 'string' || !/^[a-f0-9]{64}$/.test(sig)) return false;
    const expected = Buffer.from(sign(name, exp), 'hex');
    const given = Buffer.from(sig, 'hex');
    return expected.length === given.length && crypto.timingSafeEqual(expected, given);
};

module.exports = {
    FILE_NAME_RE,
    isValidFileName,
    contentTypeFor,
    saveFile,
    findFile,
    readFile,
    fileExists,
    deleteFile,
    deleteByOwner,
    signUrl,
    verifySignature,
};
