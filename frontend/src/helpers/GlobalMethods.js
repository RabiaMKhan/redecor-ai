// Validation and small formatting helpers shared by the forms.

const isEmailValid = (text = '') => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(text).trim());

// Returns an object of field -> message for every invalid field (empty object = valid).
const validate = (values, rules) => {
    const errors = {};
    Object.entries(rules).forEach(([field, fieldRules]) => {
        const value = typeof values[field] === 'string' ? values[field].trim() : values[field];
        for (const rule of fieldRules) {
            const message = rule(value, values);
            if (message) {
                errors[field] = message;
                break;
            }
        }
    });
    return errors;
};

const rules = {
    required: (label, message) => (value) => (!value ? message || `${label} is required` : ''),
    email: () => (value) => (value && !isEmailValid(value) ? 'Enter a valid email address' : ''),
    minLength: (n, label) => (value) => (value && value.length < n ? `${label} must be at least ${n} characters` : ''),
    maxLength: (n, label) => (value) => (value && value.length > n ? `${label} must be ${n} characters or fewer` : ''),
    matches: (field, message) => (value, values) => (value !== values[field] ? message : ''),
    otp: () => (value) => (!/^\d{6}$/.test(value || '') ? 'Enter the 6-digit code' : ''),
};

// Remove the error for a field once the user edits it
const removeError = (name, errors) => {
    if (!errors[name]) return errors;
    const next = { ...errors };
    delete next[name];
    return next;
};

// Turn an axios error into a message a person can act on
const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
    if (error?.code === 'ECONNABORTED') return 'The request took too long. Please try again.';
    if (!error?.response) return 'Cannot reach the server. Check your connection and try again.';
    if (error.response.status === 413) return 'That photo is too large to upload. Try a smaller one.';
    return error.response.data?.message || fallback;
};

const getErrorCode = (error) => error?.response?.data?.code;

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
};

const getInitials = (name = '') =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'R';

export {
    isEmailValid,
    validate,
    rules,
    removeError,
    getErrorMessage,
    getErrorCode,
    formatDate,
    getInitials,
};
