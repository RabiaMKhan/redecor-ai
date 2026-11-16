// Removing accounts and everything that belongs to them.
const userModel = require('../Models/Users');
const designModel = require('../Models/Designs');
const usageModel = require('../Models/Usage');
const storage = require('./storage');

// Designs, usage rows and every stored image (originals, visuals, profile photo).
const deleteAccountData = async (userId) => {
    await designModel.deleteMany({ user: userId });
    await usageModel.deleteMany({ user: userId });
    await storage.deleteByOwner(userId);
};

const deleteAccount = async (userId) => {
    await deleteAccountData(userId);
    await userModel.deleteOne({ _id: userId });
};

// Guest accounts last 24 hours. Called whenever a new guest is created; the batch
// size keeps that request fast even if many guests expired at once.
const cleanupExpiredGuests = async ({ batchSize = 25 } = {}) => {
    const expired = await userModel
        .find({ isGuest: true, guestExpiresAt: { $lt: new Date() } })
        .select('_id')
        .limit(batchSize);
    for (const { _id } of expired) {
        await deleteAccount(_id);
    }
    return expired.length;
};

module.exports = { deleteAccountData, deleteAccount, cleanupExpiredGuests };
