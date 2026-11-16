const router = require('express').Router();

const {
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
} = require('../controllers/AuthController');
const {
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
} = require('../controllers/AuthValidation');
const { ensureAuthenticated, requireFullAccount } = require('../Middlewares/Auth');
const { profileImageUpload } = require('../Middlewares/Upload');
const { authLimiter, guestLimiter } = require('../Middlewares/RateLimit');

router.use(authLimiter);

// Public
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/guest', guestLimiter, createGuest);
router.post('/verify-email', emailValidation, emailVerification);
router.post('/verify-otp', otpValidation, otpVerification);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.post('/send-message', contactValidation, sendMessage);

// Logged in
router.get('/me', ensureAuthenticated, getMe);
router.put('/update-profile', ensureAuthenticated, profileImageUpload, updateProfileValidation, updateProfile);
// Guests (one-click demo accounts) can't change email or password.
router.patch('/update-email', ensureAuthenticated, requireFullAccount, updateEmailValidation, updateEmail);
router.post('/confirm-email', ensureAuthenticated, requireFullAccount, confirmEmailValidation, confirmEmail);
router.post('/change-password', ensureAuthenticated, requireFullAccount, changePasswordValidation, changePassword);
router.delete('/delete-user', ensureAuthenticated, deleteUserValidation, deleteUser);

module.exports = router;
