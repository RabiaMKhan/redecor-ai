const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Stored images (room photos, AI visuals, profile photos).
// They live in MongoDB because serverless hosts like Vercel have no permanent disk.
// They are only served through signed, expiring URLs (GET /media/:name?exp=&sig=).
const mediaSchema = new Schema({
    name: { type: String, required: true, unique: true }, // "<uuid>.<ext>"
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false },
    owner: { type: Schema.Types.ObjectId, ref: 'users', index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

const mediaModel = mongoose.model('media', mediaSchema);

module.exports = mediaModel;
