const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sharp = require('sharp');

const userModel = require('../Models/Users');
const storage = require('../utils/storage');
const { deleteAccount, cleanupExpiredGuests } = require('../utils/accounts');
const { signToken } = require('../Middlewares/Auth');
const { AppError, asyncHandler, sendSuccess } = require('../utils/AppError');
const { generateOtp, checkOtp } = require('../utils/otp');
const { sendMail, sendOtpEmail } = require('../utils/mailer');

const SALT_ROUNDS = 10;
const GUEST_TTL_MS = 24 * 60 * 60 * 1000;
// The main OTP is shared by email verification and password reset (one "verify-email" request serves both).
const ACCOUNT_OTP = 'account';
const EMAIL_CHANGE_OTP = 'email-change';

const OTP_FIELDS = '+otpHash +otpExpiry +otpAttempts';
const PENDING_EMAIL_FIELDS = '+pendingEmail +pendingEmailOtpHash +pendingEmailOtpExpiry +pendingEmailOtpAttempts';

// Creates a fresh account OTP on the user (not saved yet) and returns the plain code to email.
const issueAccountOtp = (user) => {
    const { code, hash, expiry } = generateOtp(user.email, ACCOUNT_OTP);
    user.otpHash = hash;
    user.otpExpiry = expiry;
    user.otpAttempts = 0;
    return code;
};

const clearAccountOtp = (user) => {
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
};

// Checks the account OTP. Saves the attempt count when wrong and throws INVALID_OTP.
const verifyAccountOtp = async (user, code) => {
    if (!user) {
        throw new AppError(400, 'Invalid code. Please check it and try again.', 'INVALID_OTP');
    }
    const attempts = checkOtp(
        { hash: user.otpHash, expiry: user.otpExpiry, attempts: user.otpAttempts },
        code,
        user.email,
        ACCOUNT_OTP,
    );
    if (attempts !== null) {
        user.otpAttempts = attempts;
        await user.save();
        throw new AppError(400, 'Invalid code. Please check it and try again.', 'INVALID_OTP');
    }
};

// Signup
const signup = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    let user = await userModel.findOne({ email });

    if (user && user.isEmailVerified) {
        throw new AppError(409, 'An account with this email already exists. Please log in.', 'EMAIL_TAKEN');
    }

    if (!user) {
        user = new userModel({ username, email });
    }
    // An unverified account can be claimed again (e.g. the first code never arrived).
    user.username = username;
    user.password = await bcrypt.hash(password, SALT_ROUNDS);
    user.isEmailVerified = false;
    const code = issueAccountOtp(user);
    await user.save();

    await sendOtpEmail(email, code, 'verify');

    sendSuccess(res, 201, 'Account created. We sent a 6-digit code to your email.');
});

// Sends a fresh code (resend during signup, or the first step of password reset)
const emailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findOne({ email }).select(OTP_FIELDS);

    if (user) {
        const code = issueAccountOtp(user);
        await user.save();
        await sendOtpEmail(email, code, user.isEmailVerified ? 'reset' : 'verify');
    }

    // Same answer either way, so this endpoint can't be used to find registered emails.
    sendSuccess(res, 200, 'If that email is registered, a code has been sent');
});

// Verifies the signup code
const otpVerification = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email }).select(OTP_FIELDS);

    await verifyAccountOtp(user, otp);

    user.isEmailVerified = true;
    clearAccountOtp(user);
    await user.save();

    sendSuccess(res, 200, 'Email verified. You can now log in.');
});

// Sets a new password using the emailed code
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await userModel.findOne({ email }).select(OTP_FIELDS);

    await verifyAccountOtp(user, otp);

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.isEmailVerified = true; // they proved they own the inbox
    clearAccountOtp(user);
    await user.save();

    sendSuccess(res, 200, 'Password updated. You can now log in.');
});

// Login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select(`+password ${OTP_FIELDS}`);

    // Check the password first so unverified accounts can't be detected without it.
    const passwordOk = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !passwordOk) {
        throw new AppError(401, 'Email or password is wrong.', 'INVALID_CREDENTIALS');
    }

    if (!user.isEmailVerified) {
        const code = issueAccountOtp(user);
        await user.save();
        await sendOtpEmail(email, code, 'verify');
        throw new AppError(403, 'Please verify your email first. We sent you a new code.', 'EMAIL_NOT_VERIFIED');
    }

    sendSuccess(res, 200, 'Logged in successfully', {
        ...user.toPublic(req),
        accessToken: signToken(user),
    });
});

// One-click guest account (for visitors who just want to try the app).
// It lasts 24 hours; expired guests and all their data are removed here.
const createGuest = asyncHandler(async (req, res) => {
    try {
        await cleanupExpiredGuests();
    } catch (error) {
        console.error('Guest cleanup failed:', error.message);
    }

    const user = await userModel.create({
        username: 'Guest',
        email: `guest-${crypto.randomBytes(6).toString('hex')}@guest.redecor.ai`,
        // Nobody knows this password, so a guest can only use the token below.
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS),
        isEmailVerified: true,
        isGuest: true,
        guestExpiresAt: new Date(Date.now() + GUEST_TTL_MS),
    });

    sendSuccess(res, 201, 'Welcome! Your guest account lasts 24 hours.', {
        ...user.toPublic(req),
        accessToken: signToken(user),
    });
});

// Current user
const getMe = asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Current user', req.user.toPublic(req));
});

// Update username and/or profile photo
const updateProfile = asyncHandler(async (req, res) => {
    const user = req.user;
    const { username } = req.body;

    if (!username && !req.file) {
        throw new AppError(400, 'Nothing to update.', 'VALIDATION_ERROR');
    }

    if (username) user.username = username;

    if (req.file) {
        // Re-encoding checks it is a real image and strips metadata such as GPS location.
        let webp;
        try {
            webp = await sharp(req.file.buffer)
                .rotate()
                .resize(512, 512, { fit: 'cover' })
                .webp({ quality: 85 })
                .toBuffer();
        } catch (error) {
            throw new AppError(400, 'That file is not a valid image.', 'INVALID_IMAGE');
        }
        const previous = user.profileImage;
        user.profileImage = await storage.saveFile(webp, 'webp', { owner: user._id });
        await user.save();
        if (previous && previous !== user.profileImage) await storage.deleteFile(previous);
    } else {
        await user.save();
    }

    sendSuccess(res, 200, 'Profile updated successfully', user.toPublic(req));
});

// Step 1 of changing email: send a code to the new address
const updateEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await userModel.findById(req.user._id).select(PENDING_EMAIL_FIELDS);

    if (email === user.email) {
        throw new AppError(400, 'That is already your email.', 'VALIDATION_ERROR');
    }
    const taken = await userModel.exists({ email, _id: { $ne: user._id } });
    if (taken) {
        throw new AppError(409, 'That email is already in use.', 'EMAIL_TAKEN');
    }

    const { code, hash, expiry } = generateOtp(email, EMAIL_CHANGE_OTP);
    user.pendingEmail = email;
    user.pendingEmailOtpHash = hash;
    user.pendingEmailOtpExpiry = expiry;
    user.pendingEmailOtpAttempts = 0;
    await user.save();

    await sendOtpEmail(email, code, 'email-change');

    sendSuccess(res, 200, `We sent a 6-digit code to ${email}.`);
});

// Step 2 of changing email: confirm with the code
const confirmEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const user = await userModel.findById(req.user._id).select(PENDING_EMAIL_FIELDS);

    if (!user.pendingEmail) {
        throw new AppError(400, 'There is no email change waiting. Please start again.', 'INVALID_OTP');
    }

    const attempts = checkOtp(
        { hash: user.pendingEmailOtpHash, expiry: user.pendingEmailOtpExpiry, attempts: user.pendingEmailOtpAttempts },
        otp,
        user.pendingEmail,
        EMAIL_CHANGE_OTP,
    );
    if (attempts !== null) {
        user.pendingEmailOtpAttempts = attempts;
        await user.save();
        throw new AppError(400, 'Invalid code. Please check it and try again.', 'INVALID_OTP');
    }

    // Someone may have registered the address since step 1.
    const taken = await userModel.exists({ email: user.pendingEmail, _id: { $ne: user._id } });
    if (taken) {
        throw new AppError(409, 'That email is already in use.', 'EMAIL_TAKEN');
    }

    user.email = user.pendingEmail;
    user.isEmailVerified = true;
    user.pendingEmail = undefined;
    user.pendingEmailOtpHash = undefined;
    user.pendingEmailOtpExpiry = undefined;
    user.pendingEmailOtpAttempts = 0;
    await user.save();

    sendSuccess(res, 200, 'Email updated successfully', user.toPublic(req));
});

// Change password while logged in
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await userModel.findById(req.user._id).select('+password');

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
        throw new AppError(400, 'Your current password is wrong.', 'WRONG_PASSWORD');
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    sendSuccess(res, 200, 'Password updated successfully');
});

// Delete account, saved designs and every stored image.
// Guests don't know their (random) password, so they can delete without one.
const deleteUser = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const user = await userModel.findById(req.user._id).select('+password');

    if (!user.isGuest) {
        if (!password) {
            throw new AppError(400, 'password is required', 'VALIDATION_ERROR');
        }
        const matches = await bcrypt.compare(password, user.password);
        if (!matches) {
            throw new AppError(400, 'Your password is wrong.', 'WRONG_PASSWORD');
        }
    }

    await deleteAccount(user._id); // designs, usage rows, stored images and the user
    await storage.deleteFile(user.profileImage); // in case it was saved without an owner

    sendSuccess(res, 200, 'Your account has been deleted.');
});

// Contact form
const sendMessage = asyncHandler(async (req, res) => {
    const { firstName, lastName, emailAddress, message } = req.body;
    const oneLine = (value) => value.replace(/[\r\n]+/g, ' ');

    await sendMail({
        to: process.env.EMAIL_USER || 'contact@redecor.local',
        replyTo: emailAddress,
        subject: `Redecor AI contact form: ${oneLine(firstName)} ${oneLine(lastName)}`,
        text: `Message from ${oneLine(firstName)} ${oneLine(lastName)} <${emailAddress}>:\n\n${message}`,
    });

    sendSuccess(res, 200, 'Message sent successfully!');
});

module.exports = {
    signup,
    login,
    createGuest,
    emailVerification,
    otpVerification,
    resetPassword,
    getMe,
    updateProfile,
    updateEmail,
    confirmEmail,
    changePassword,
    deleteUser,
    sendMessage,
};
