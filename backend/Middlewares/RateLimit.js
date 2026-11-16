const { rateLimit } = require('express-rate-limit');

const limitHandler = (message) => (req, res) => {
    res.status(429).json({ success: false, message, code: 'RATE_LIMITED' });
};

const makeLimiter = ({ windowMs, limit, message }) => rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: limitHandler(message),
});

// Slows down password guessing and OTP spam on /auth.
const authLimiter = makeLimiter({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT) || 50,
    message: 'Too many requests. Please wait a few minutes and try again.',
});

// Each AI request costs money, so keep bursts small (daily caps are checked in the controller).
const analyzeLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    limit: Number(process.env.AI_RATE_LIMIT) || 10,
    message: 'Too many photos in a short time. Please wait a few minutes and try again.',
});

const visualizeLimiter = makeLimiter({
    windowMs: 10 * 60 * 1000,
    limit: Number(process.env.AI_RATE_LIMIT) || 10,
    message: 'Too many visuals in a short time. Please wait a few minutes and try again.',
});

// One-click guest accounts: enough for a visitor to try the app a few times.
const guestLimiter = makeLimiter({
    windowMs: 60 * 60 * 1000,
    limit: Number(process.env.GUEST_RATE_LIMIT) || 10,
    message: 'Too many guest sessions from this network. Please try again later or create a free account.',
});

module.exports = { authLimiter, analyzeLimiter, visualizeLimiter, guestLimiter };
