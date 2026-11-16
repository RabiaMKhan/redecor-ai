const nodemailer = require('nodemailer');
const { AppError } = require('./AppError');

let transporter = null;
let devMailHook = null;

const isMailConfigured = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // a Gmail app password, never the account password
            },
        });
    }
    return transporter;
};

// Tests use this to read codes without logging them or sending real mail.
const setDevMailHook = (hook) => {
    devMailHook = hook;
};

/**
 * Sends an email. Without EMAIL_USER/EMAIL_PASS (local development) the email is
 * printed to the console instead, so sign-up works without a Gmail account.
 * `meta.code` is only used for that console line.
 */
const sendMail = async ({ to, subject, text, replyTo, meta = {} }) => {
    if (!isMailConfigured()) {
        if (process.env.NODE_ENV === 'production') {
            throw new AppError(500, 'Email is not configured on the server.', 'MAIL_NOT_CONFIGURED');
        }
        if (devMailHook) devMailHook({ to, subject, text, replyTo, ...meta });
        if (process.env.NODE_ENV !== 'test') {
            const codePart = meta.code ? ` code=${meta.code}` : '';
            console.log(`[dev-mail] to=${to} subject="${subject}"${codePart}`);
        }
        return;
    }

    try {
        await getTransporter().sendMail({
            from: `"Redecor AI" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            replyTo,
        });
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new AppError(502, 'Could not send the email. Please try again.', 'MAIL_FAILED');
    }
};

const PURPOSE_TEXT = {
    verify: 'verify your email',
    reset: 'verify your email or reset your password',
    'email-change': 'confirm your new email address',
};

const sendOtpEmail = (to, code, purpose = 'verify') => sendMail({
    to,
    subject: 'Your Redecor AI code',
    text: `Your Redecor AI code is ${code}. Use it to ${PURPOSE_TEXT[purpose] || PURPOSE_TEXT.verify}. It expires in 10 minutes.\n\nIf you did not ask for this, you can ignore this email.`,
    meta: { code, purpose },
});

module.exports = { sendMail, sendOtpEmail, setDevMailHook, isMailConfigured };
