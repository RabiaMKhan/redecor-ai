const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// One row per paid AI call (analysis or visual), used for the daily limits.
// Kept apart from designs so deleting a design does not reset the count.
// MongoDB removes rows automatically after 2 days (TTL index).
const usageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    kind: { type: String, enum: ['analysis', 'visual'], required: true },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 48 },
});

usageSchema.index({ user: 1, kind: 1, createdAt: -1 });

usageSchema.statics.countSince = function (userId, kind, since) {
    return this.countDocuments({ user: userId, kind, createdAt: { $gte: since } });
};

const usageModel = mongoose.model('usage', usageSchema);

module.exports = usageModel;
