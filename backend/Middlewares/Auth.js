const jwt = require('jsonwebtoken');
const userModel = require('../Models/Users');
const { AppError } = require('../utils/AppError');

const TOKEN_EXPIRY = '7d';
const GUEST_TOKEN_EXPIRY = '24h';

// A missing secret is a deployment mistake: log it clearly and fail the request,
// instead of crashing when the module loads.
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is missing. Set it in the environment (e.g. Vercel project settings).');
        throw new AppError(500, 'The server is not configured correctly.', 'SERVER_MISCONFIGURED');
    }
    return secret;
};

const signToken = (user) => jwt.sign(
    { _id: user._id.toString(), email: user.email },
    getJwtSecret(),
    { expiresIn: user.isGuest ? GUEST_TOKEN_EXPIRY : TOKEN_EXPIRY },
);

// Reads "Authorization: Bearer <token>", checks it and puts the user on req.user.
const ensureAuthenticated = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        const [scheme, token] = header.split(' ');
        if (scheme !== 'Bearer' || !token) {
            throw new AppError(401, 'Please log in to continue.', 'UNAUTHORIZED');
        }

        const secret = getJwtSecret();
        let payload;
        try {
            payload = jwt.verify(token, secret);
        } catch (error) {
            throw new AppError(401, 'Your session has expired. Please log in again.', 'UNAUTHORIZED');
        }

        // Password and OTP fields are select:false, so they are not loaded here.
        const user = await userModel.findById(payload._id);
        if (!user) {
            throw new AppError(401, 'Your account was not found. Please log in again.', 'UNAUTHORIZED');
        }
        if (user.isExpiredGuest()) {
            throw new AppError(401, 'Your guest session has ended. Start a new one or create a free account.', 'UNAUTHORIZED');
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

// For features that need a real account (email and password changes).
const requireFullAccount = (req, res, next) => {
    if (req.user?.isGuest) {
        return next(new AppError(403, 'Create a free account to use this.', 'GUEST_NOT_ALLOWED'));
    }
    next();
};

module.exports = { ensureAuthenticated, requireFullAccount, signToken, getJwtSecret };
