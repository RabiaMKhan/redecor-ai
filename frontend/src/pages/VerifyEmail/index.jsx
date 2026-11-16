import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout, Button, OTPInput } from '../../components/shared';
import ResendCode from '../../components/shared/ResendCode';
import { getErrorMessage } from '../../helpers/GlobalMethods';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';
import { usePageTitle } from '../../utils/utils';

const VerifyEmail = () => {
    usePageTitle('Verify your email');
    const navigate = useNavigate();
    const { state } = useLocation();
    const email = state?.email;
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!email) {
        return <Navigate to="/signup" replace />;
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            setError('Enter the 6-digit code');
            return;
        }
        setLoading(true);
        try {
            await axios.post(endPoints.verifyOTP, { email, otp });
            toast.success('Email verified. You can sign in now.');
            navigate('/login', { replace: true, state: { email, from: state?.from } });
        } catch (err) {
            setError(getErrorMessage(err, 'That code did not work.'));
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    const resend = async () => {
        try {
            await axios.post(endPoints.verifyEmail, { email });
            toast.success('A new code is on its way.');
            setError('');
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err));
            return false;
        }
    };

    return (
        <AuthLayout
            title="Check your email"
            subtitle={
                <>
                    We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. It expires in 10 minutes.
                </>
            }
            footer={
                <>
                    Wrong email?{' '}
                    <Link to="/signup" className="font-medium text-clay hover:underline">
                        Sign up again
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
                <OTPInput
                    value={otp}
                    onChange={(value) => {
                        setOtp(value);
                        setError('');
                    }}
                    error={error}
                    disabled={loading}
                />
                <Button type="submit" size="lg" loading={loading} fullWidth disabled={otp.length !== 6}>
                    Verify email
                </Button>
                <ResendCode onResend={resend} />
            </form>
        </AuthLayout>
    );
};

export default VerifyEmail;
