const mongoose = require('mongoose');

// Local setups use MONGO_URL; Vercel's MongoDB Atlas integration sets MONGODB_URI.
const getMongoUrl = () => process.env.MONGO_URL || process.env.MONGODB_URI;

const connectDB = (mongoUrl = getMongoUrl()) => {
    if (!mongoUrl) {
        throw new Error('MONGO_URL (or MONGODB_URI) is missing');
    }
    return mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: Number(process.env.DB_TIMEOUT_MS) || 10000,
        // Atlas links often have no database name (Mongoose would use "test"); MONGODB_DB picks one
        ...(process.env.MONGODB_DB && { dbName: process.env.MONGODB_DB }),
    });
};

// Serverless functions are reused between requests, so connect once and share the
// promise. If connecting fails, forget the promise so the next request retries.
let connecting = null;
const ensureConnected = () => {
    if (mongoose.connection.readyState === 1) {
        return Promise.resolve(mongoose.connection);
    }
    if (!connecting) {
        try {
            connecting = connectDB().catch((error) => {
                connecting = null;
                throw error;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    }
    return connecting;
};

// Express middleware: waits for the database, or answers 503 (after CORS, so the
// browser can read the message).
const makeRequireDatabase = (connect = ensureConnected) => async (req, res, next) => {
    try {
        await connect();
        next();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        res.status(503).json({
            success: false,
            message: 'The service is starting up or unavailable. Please try again.',
            code: 'SERVICE_UNAVAILABLE',
        });
    }
};

const disconnectDB = () => {
    connecting = null;
    return mongoose.disconnect();
};

module.exports = { connectDB, ensureConnected, makeRequireDatabase, disconnectDB, getMongoUrl };
