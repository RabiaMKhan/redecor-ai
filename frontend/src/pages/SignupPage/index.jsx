import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout, Button, TextField } from '../../components/shared';
import { getErrorMessage, removeError, rules, validate } from '../../helpers/GlobalMethods';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';
import { usePageTitle } from '../../utils/utils';
import zen from '../../assets/images/styles/zen.webp';

const SignupPage = () => {
    usePageTitle('Create account');
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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
            username: [rules.required('Name'), rules.minLength(3, 'Name'), rules.maxLength(50, 'Name')],
            email: [rules.required('Email'), rules.email()],
            password: [rules.required('Password'), rules.minLength(8, 'Password')],
            confirmPassword: [rules.required(null, 'Please confirm your password'), rules.matches('password', 'Passwords do not match')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;

        setLoading(true);
        try {
            const email = form.email.trim();
            await axios.post(endPoints.signup, { username: form.username.trim(), email, password: form.password });
            toast.success('Account created. Check your email for a 6-digit code.');
            navigate('/verify-email', { state: { email, from: location.state?.from } });
        } catch (error) {
            toast.error(getErrorMessage(error, 'We could not create your account. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Free to use. Every analysis and visual is saved so you can come back to it any time."
            image={zen}
            quote="“Start with the room you have. Make it the room you want.”"
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" state={location.state} className="font-medium text-clay hover:underline">
                        Sign in
                    </Link>
                </>
            }
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <TextField label="Name" name="username" autoComplete="name" value={form.username} onChange={onChange} error={errors.username} autoFocus />
                <TextField label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={onChange}
                    error={errors.password}
                    hint="At least 8 characters"
                />
                <TextField
                    label="Confirm password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    error={errors.confirmPassword}
                />
                <Button type="submit" size="lg" loading={loading} fullWidth>
                    Create account
                </Button>
            </form>
        </AuthLayout>
    );
};

export default SignupPage;
