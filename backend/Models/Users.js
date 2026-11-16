const mongoose = require('mongoose');
const { signUrl, isValidFileName } = require('../utils/storage');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    // Storage name of the profile photo ("<uuid>.webp"). Older values from the
    // disk-based version are ignored.
    profileImage: { type: String, default: '' },

    // One-click demo accounts. They expire after 24 hours and are cleaned up.
    isGuest: { type: Boolean, default: false },
    guestExpiresAt: { type: Date },

    // One-time code for email verification and password reset (only a hash is stored).
    otpHash: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },

    // Email change waits here until the code sent to the new address is confirmed.
    pendingEmail: { type: String, lowercase: true, trim: true, select: false },
    pendingEmailOtpHash: { type: String, select: false },
    pendingEmailOtpExpiry: { type: Date, select: false },
    pendingEmailOtpAttempts: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.index({ isGuest: 1, guestExpiresAt: 1 });

userSchema.methods.isExpiredGuest = function () {
    return Boolean(this.isGuest && this.guestExpiresAt && this.guestExpiresAt.getTime() < Date.now());
};

// Profile photos are private images too, shown through a signed URL.
userSchema.methods.profileImageUrl = function (req) {
    if (!this.profileImage || !isValidFileName(this.profileImage)) return '';
    return signUrl(req, this.profileImage);
};

// The only user shape the API ever returns.
userSchema.methods.toPublic = function (req) {
    return {
        id: this._id.toString(),
        username: this.username,
        email: this.email,
        profileImage: this.profileImageUrl(req),
        emailVerified: Boolean(this.isEmailVerified),
        isGuest: Boolean(this.isGuest),
        guestExpiresAt: this.isGuest && this.guestExpiresAt ? this.guestExpiresAt : null,
        createdAt: this.createdAt,
    };
};

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
