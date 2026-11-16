const crypto = require('crypto');
const { AppError } = require('./AppError');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

const otpSecret = () => process.env.OTP_SECRET || process.env.JWT_SECRET || '';

// HMAC instead of a plain hash, so a leaked database alone can't be brute-forced
// for 6-digit codes. The email and purpose are mixed in so a code only works where
// it was issued.
const hashOtp = (code, email, purpose) =>
    crypto.createHmac('sha256', otpSecret()).update(`${purpose}:${email}:${code}`).digest('hex');

const generateOtp = (email, purpose) => {
    const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    return {
        code,
        hash: hashOtp(code, email, purpose),
        expiry: new Date(Date.now() + OTP_TTL_MS),
    };
};

const safeEqualHex = (a, b) => {
    const bufA = Buffer.from(String(a || ''), 'hex');
    const bufB = Buffer.from(String(b || ''), 'hex');
    return bufA.length === bufB.length && bufA.length > 0 && crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Checks a submitted code against stored values. Throws an AppError when it fails.
 * `record` holds { hash, expiry, attempts }; the caller saves the attempt count.
 * Returns the new attempt count when the code is wrong (so it can be stored), or
 * null when the code is right.
 */
const checkOtp = ({ hash, expiry, attempts = 0 }, code, email, purpose) => {
    if (!hash || !expiry) {
        throw new AppError(400, 'Invalid code. Please request a new one.', 'INVALID_OTP');
    }
    if (attempts >= MAX_ATTEMPTS) {
        throw new AppError(429, 'Too many wrong attempts. Please request a new code.', 'TOO_MANY_ATTEMPTS');
    }
    if (new Date(expiry).getTime() < Date.now()) {
        throw new AppError(400, 'This code has expired. Please request a new one.', 'OTP_EXPIRED');
    }
    if (!safeEqualHex(hashOtp(String(code).trim(), email, purpose), hash)) {
        return attempts + 1;
    }
    return null;
};

module.exports = { generateOtp, checkOtp, hashOtp, OTP_TTL_MS, MAX_ATTEMPTS };
