// An error that is safe to show to the client: status code, short message, machine code.
class AppError extends Error {
    constructor(status, message, code) {
        super(message);
        this.name = 'AppError';
        this.status = status;
        this.code = code;
    }
}

// Express 4 does not catch rejected promises, so every async handler goes through this.
const asyncHandler = (handler) => (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
};

const sendSuccess = (res, status, message, data) => {
    const body = { success: true, message };
    if (data !== undefined) body.data = data;
    return res.status(status).json(body);
};

module.exports = { AppError, asyncHandler, sendSuccess };
