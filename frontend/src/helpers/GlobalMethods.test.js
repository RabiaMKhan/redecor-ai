import { getErrorMessage, getInitials, isEmailValid, removeError, rules, validate } from './GlobalMethods';

describe('isEmailValid', () => {
    it.each(['a@b.co', 'first.last@example.com', ' spaced@example.com '])('accepts %s', (email) => {
        expect(isEmailValid(email)).toBe(true);
    });

    it.each(['', 'plain', 'a@b', 'a@b.c', 'two@@example.com'])('rejects %s', (email) => {
        expect(isEmailValid(email)).toBe(false);
    });
});

describe('validate', () => {
    const signupRules = {
        username: [rules.required('Name'), rules.minLength(3, 'Name')],
        email: [rules.required('Email'), rules.email()],
        password: [rules.required('Password'), rules.minLength(8, 'Password')],
        confirmPassword: [rules.required(null, 'Please confirm your password'), rules.matches('password', 'Passwords do not match')],
    };

    it('returns one message per invalid field, first failing rule wins', () => {
        const errors = validate({ username: 'ab', email: '', password: 'short', confirmPassword: '' }, signupRules);
        expect(errors).toEqual({
            username: 'Name must be at least 3 characters',
            email: 'Email is required',
            password: 'Password must be at least 8 characters',
            confirmPassword: 'Please confirm your password',
        });
    });

    it('returns an empty object for valid values', () => {
        const values = { username: 'Rabia', email: 'r@example.com', password: 'long-enough', confirmPassword: 'long-enough' };
        expect(validate(values, signupRules)).toEqual({});
    });

    it('catches mismatched passwords', () => {
        const values = { username: 'Rabia', email: 'r@example.com', password: 'long-enough', confirmPassword: 'different!' };
        expect(validate(values, signupRules)).toEqual({ confirmPassword: 'Passwords do not match' });
    });

    it('trims strings before checking required', () => {
        expect(validate({ username: '   ' }, { username: [rules.required('Name')] })).toEqual({ username: 'Name is required' });
    });

    it('checks one-time codes are exactly 6 digits', () => {
        const otpRules = { otp: [rules.otp()] };
        expect(validate({ otp: '123456' }, otpRules)).toEqual({});
        expect(validate({ otp: '12345' }, otpRules)).toEqual({ otp: 'Enter the 6-digit code' });
        expect(validate({ otp: '12a456' }, otpRules)).toEqual({ otp: 'Enter the 6-digit code' });
    });
});

describe('removeError', () => {
    it('drops only the named field and keeps the same object when nothing changes', () => {
        const errors = { email: 'x', password: 'y' };
        expect(removeError('email', errors)).toEqual({ password: 'y' });
        expect(removeError('username', errors)).toBe(errors);
    });
});

describe('getErrorMessage', () => {
    it('uses the API message when there is one', () => {
        expect(getErrorMessage({ response: { data: { message: 'Invalid code' } } })).toBe('Invalid code');
    });

    it('explains network errors and timeouts', () => {
        expect(getErrorMessage({})).toMatch(/Cannot reach the server/);
        expect(getErrorMessage({ code: 'ECONNABORTED' })).toMatch(/took too long/);
    });

    it('falls back when the API gives no message', () => {
        expect(getErrorMessage({ response: { data: {} } }, 'Fallback')).toBe('Fallback');
    });
});

describe('getInitials', () => {
    it('uses up to two initials', () => {
        expect(getInitials('rabia khan')).toBe('RK');
        expect(getInitials('Rabia Mehmood Khan')).toBe('RM');
        expect(getInitials('')).toBe('R');
    });
});
