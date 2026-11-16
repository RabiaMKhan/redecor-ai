import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { AuthLayout, Button, GuestButton, TextField } from '../../components/shared';
import { getErrorCode, getErrorMessage, removeError, rules, validate } from '../../helpers/GlobalMethods';
import { loginUser } from '../../redux/actions/userActions';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';
import { AFTER_LOGIN_PATH, usePageTitle } from '../../utils/utils';

const LoginPage = () => {
    usePageTitle('Sign in');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from || AFTER_LOGIN_PATH;
    const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((e) => removeError(name, e));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        const found = validate(form, {
            email: [rules.required('Email'), rules.email()],
            password: [rules.required('Password')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;

        setLoading(true);
        try {
            const { data } = await axios.post(endPoints.login, { email: form.email.trim(), password: form.password });
            dispatch(loginUser(data.data));
            toast.success(`Welcome back, ${data.data?.username || 'there'}!`);
            navigate(redirectTo, { replace: true });
        } catch (error) {
            if (getErrorCode(error) === 'EMAIL_NOT_VERIFIED') {
                toast('Please verify your email first. We sent you a new code.', { icon: '✉️' });
                navigate('/verify-email', { state: { email: form.email.trim(), from: redirectTo } });
                return;
            }
            toast.error(getErrorMessage(error, 'Email or password is incorrect.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to analyse a space and see the designs you've saved."
            footer={
                <>
                    New to Redecor AI?{' '}
                    <Link to="/signup" state={location.state} className="font-medium text-clay hover:underline">
                        Create an account
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <TextField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} autoFocus />
                <div className="flex flex-col gap-2">
                    <TextField label="Password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} error={errors.password} />
                    <Link to="/forget-password" state={{ email: form.email }} className="self-end text-sm text-muted hover:text-clay">
                        Forgot password?
                    </Link>
                </div>
                <Button type="submit" size="lg" loading={loading} fullWidth>
                    Sign in
                </Button>
            </form>
            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <GuestButton to={redirectTo} size="lg" fullWidth label="Just looking? Try as a guest" />
            <p className="mt-2 text-center text-xs text-muted">No sign-up. Guest designs are deleted after 24 hours.</p>
        </AuthLayout>
    );
};

export default LoginPage;
