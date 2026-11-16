import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout, Button, OTPInput, TextField } from '../../components/shared';
import ResendCode from '../../components/shared/ResendCode';
import { getErrorMessage, removeError, rules, validate } from '../../helpers/GlobalMethods';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';
import { usePageTitle } from '../../utils/utils';
import french from '../../assets/images/styles/french.webp';

// Two steps: 1) email → code is sent  2) code + new password
const ForgetPassword = () => {
    usePageTitle('Reset password');
    const navigate = useNavigate();
    const { state } = useLocation();
    const [step, setStep] = useState('email');
    const [email, setEmail] = useState(state?.email || '');
    const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const sendCode = async () => {
        await axios.post(endPoints.verifyEmail, { email: email.trim() });
    };

    const onEmailSubmit = async (event) => {
        event.preventDefault();
        const found = validate({ email }, { email: [rules.required('Email'), rules.email()] });
        setErrors(found);
        if (Object.keys(found).length) return;
        setLoading(true);
        try {
            await sendCode();
            setStep('reset');
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const onResetSubmit = async (event) => {
        event.preventDefault();
        const found = validate(form, {
            otp: [rules.otp()],
            newPassword: [rules.required('New password'), rules.minLength(8, 'Password')],
            confirmPassword: [rules.required(null, 'Please confirm your password'), rules.matches('newPassword', 'Passwords do not match')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        setLoading(true);
        try {
            await axios.post(endPoints.resetPassword, { email: email.trim(), otp: form.otp, newPassword: form.newPassword });
            toast.success('Password updated. Sign in with your new password.');
            navigate('/login', { replace: true, state: { email: email.trim() } });
        } catch (error) {
            setErrors({ otp: getErrorMessage(error, 'That code did not work.') });
        } finally {
            setLoading(false);
        }
    };

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((e) => removeError(name, e));
    };

    const backToLogin = (
        <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-clay hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
    );

    if (step === 'email') {
        return (
            <AuthLayout
                title="Forgot your password?"
                subtitle="Enter the email you signed up with and we'll send you a code to reset it."
                image={french}
                footer={backToLogin}
            >
                <form onSubmit={onEmailSubmit} noValidate className="flex flex-col gap-5">
                    <TextField
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrors({});
                        }}
                        error={errors.email}
                        autoFocus
                    />
                    <Button type="submit" size="lg" loading={loading} fullWidth>
                        Send reset code
                    </Button>
                </form>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Set a new password"
            subtitle={
                <>
                    If <span className="font-medium text-ink">{email}</span> has an account, a 6-digit code is on its way.
                </>
            }
            image={french}
            footer={
                <button type="button" onClick={() => setStep('email')} className="font-medium text-clay hover:underline">
                    Use a different email
                </button>
            }
        >
            <form onSubmit={onResetSubmit} noValidate className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-ink">Reset code</span>
                    <OTPInput
                        value={form.otp}
                        onChange={(otp) => {
                            setForm((f) => ({ ...f, otp }));
                            setErrors((e) => removeError('otp', e));
                        }}
                        error={errors.otp}
                        disabled={loading}
                    />
                </div>
                <TextField
                    label="New password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.newPassword}
                    onChange={onChange}
                    error={errors.newPassword}
                    hint="At least 8 characters"
                />
                <TextField
                    label="Confirm new password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    error={errors.confirmPassword}
                />
                <Button type="submit" size="lg" loading={loading} fullWidth>
                    Update password
                </Button>
                <ResendCode
                    onResend={async () => {
                        try {
                            await sendCode();
                            toast.success('A new code is on its way.');
                            return true;
                        } catch (error) {
                            toast.error(getErrorMessage(error));
                            return false;
                        }
                    }}
                />
            </form>
        </AuthLayout>
    );
};

export default ForgetPassword;
