const joi = require('joi');
const { AppError } = require('../utils/AppError');

const email = joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254);
const password = joi.string().min(8).max(128);
const otp = joi.string().trim().pattern(/^\d{6}$/).messages({ 'string.pattern.base': 'Code must be 6 digits' });
const username = joi.string().trim().min(3).max(50);

// Builds a middleware that validates req.body and replaces it with the cleaned value.
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body || {}, { abortEarly: true, stripUnknown: true, convert: true });
    if (error) {
        const message = error.details[0].message.replace(/"/g, '');
        return next(new AppError(400, message, 'VALIDATION_ERROR'));
    }
    req.body = value;
    next();
};

const signupValidation = validate(joi.object({
    username: username.required(),
    email: email.required(),
    password: password.required(),
}));

const loginValidation = validate(joi.object({
    email: email.required(),
    password: joi.string().max(128).required(),
}));

const emailValidation = validate(joi.object({
    email: email.required(),
}));

const otpValidation = validate(joi.object({
    email: email.required(),
    otp: otp.required(),
}));

const resetPasswordValidation = validate(joi.object({
    email: email.required(),
    otp: otp.required(),
    newPassword: password.required(),
}));

const updateProfileValidation = validate(joi.object({
    username: username.optional(),
}));

const updateEmailValidation = validate(joi.object({
    email: email.required(),
}));

const confirmEmailValidation = validate(joi.object({
    otp: otp.required(),
}));

const changePasswordValidation = validate(joi.object({
    currentPassword: joi.string().max(128).required(),
    newPassword: password.required(),
}));

// Password is checked in the controller: required for normal accounts, not for guests.
const deleteUserValidation = validate(joi.object({
    password: joi.string().max(128).allow(''),
}));

const contactValidation = validate(joi.object({
    firstName: joi.string().trim().max(60).required(),
    lastName: joi.string().trim().max(60).required(),
    emailAddress: email.required(),
    message: joi.string().trim().max(2000).required(),
}));

// Multipart fields for POST /ai/analyze (the image itself is checked by multer + sharp).
const analyzeValidation = validate(joi.object({
    notes: joi.string().trim().max(500).allow('').default(''),
}));

module.exports = {
    validate,
    signupValidation,
    loginValidation,
    emailValidation,
    otpValidation,
    resetPasswordValidation,
    updateProfileValidation,
    updateEmailValidation,
    confirmEmailValidation,
    changePasswordValidation,
    deleteUserValidation,
    contactValidation,
    analyzeValidation,
};
