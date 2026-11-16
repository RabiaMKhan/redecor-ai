import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Camera, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { Avatar, Button, OTPInput, TextField } from '../../shared';
import ResendCode from '../../shared/ResendCode';
import { useCurrentUser } from '../../../utils/utils';
import { getErrorMessage, removeError, rules, validate } from '../../../helpers/GlobalMethods';
import resizeImage from '../../../helpers/resizeImage';
import { updateUser } from '../../../redux/slices/userSlice';
import axios from '../../../redux/https';
import { endPoints } from '../../../redux/constants';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const SettingsSection = ({ title, text, children }) => (
    <section className="card grid gap-6 p-6 sm:p-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
        <div>
            <h2 className="font-display text-2xl text-ink">{title}</h2>
            {text && <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>}
        </div>
        <div>{children}</div>
    </section>
);

const ProfileForm = () => {
    const user = useCurrentUser();
    const dispatch = useDispatch();
    const fileRef = useRef(null);
    const [username, setUsername] = useState(user?.username || '');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

    const pickFile = (event) => {
        const selected = event.target.files?.[0];
        event.target.value = '';
        if (!selected) return;
        if (!IMAGE_TYPES.includes(selected.type)) return toast.error('Use a JPG, PNG or WebP image.');
        if (selected.size > 10 * 1024 * 1024) return toast.error('That photo is over 10 MB. Try a smaller one.');
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    const changed = file || username.trim() !== (user?.username || '');

    const onSubmit = async (event) => {
        event.preventDefault();
        const found = validate({ username }, { username: [rules.required('Name'), rules.minLength(3, 'Name'), rules.maxLength(50, 'Name')] });
        if (found.username) return setError(found.username);
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username.trim());
            // The server keeps a 512 px version anyway; shrinking here keeps uploads small and under its 2 MB limit
            if (file) formData.append('profileImage', await resizeImage(file, { maxSize: 600, skipBelowBytes: 300 * 1024 }).catch(() => file));
            const { data } = await axios.put(endPoints.updateProfile, formData);
            dispatch(updateUser(data.data));
            setFile(null);
            setPreview('');
            toast.success('Profile updated.');
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex items-center gap-5">
                <Avatar src={preview || user?.profileImage} name={user?.username} size="lg" />
                <div className="flex flex-col gap-1.5">
                    <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(',')} className="sr-only" onChange={pickFile} tabIndex={-1} aria-hidden="true" />
                    <Button variant="secondary" size="sm" icon={Camera} onClick={() => fileRef.current?.click()}>
                        {user?.profileImage || preview ? 'Change photo' : 'Add a photo'}
                    </Button>
                    <p className="text-xs text-muted">JPG, PNG or WebP, up to 2 MB</p>
                </div>
            </div>
            <TextField
                label="Name"
                value={username}
                autoComplete="name"
                onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                }}
                error={error}
            />
            <Button type="submit" loading={loading} disabled={!changed} className="self-start">
                Save changes
            </Button>
        </form>
    );
};

const EmailForm = () => {
    const user = useCurrentUser();
    const dispatch = useDispatch();
    const [step, setStep] = useState('edit');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const sendCode = async (event) => {
        event?.preventDefault();
        const found = validate({ email }, { email: [rules.required('New email'), rules.email()] });
        if (!found.email && email.trim().toLowerCase() === user?.email?.toLowerCase()) found.email = 'This is already your email';
        setErrors(found);
        if (Object.keys(found).length) return false;
        setLoading(true);
        try {
            await axios.patch(endPoints.updateEmail, { email: email.trim() });
            setStep('confirm');
            toast.success(`We sent a code to ${email.trim()}.`);
            return true;
        } catch (err) {
            setErrors({ email: getErrorMessage(err) });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const confirm = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) return setErrors({ otp: 'Enter the 6-digit code' });
        setLoading(true);
        try {
            const { data } = await axios.post(endPoints.confirmEmail, { otp });
            dispatch(updateUser(data.data));
            toast.success('Email updated.');
            setStep('edit');
            setEmail('');
            setOtp('');
        } catch (err) {
            setErrors({ otp: getErrorMessage(err, 'That code did not work.') });
            setOtp('');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'confirm') {
        return (
            <form onSubmit={confirm} noValidate className="flex flex-col gap-5">
                <p className="text-sm text-muted">
                    Enter the 6-digit code we sent to <span className="font-medium text-ink">{email.trim()}</span>.
                </p>
                <OTPInput value={otp} onChange={(v) => { setOtp(v); setErrors({}); }} error={errors.otp} disabled={loading} />
                <div className="flex flex-wrap items-center gap-3">
                    <Button type="submit" loading={loading} disabled={otp.length !== 6}>
                        Confirm new email
                    </Button>
                    <Button variant="ghost" onClick={() => { setStep('edit'); setOtp(''); setErrors({}); }}>
                        Cancel
                    </Button>
                </div>
                <ResendCode onResend={() => sendCode()} />
            </form>
        );
    }

    return (
        <form onSubmit={sendCode} noValidate className="flex flex-col gap-5">
            <p className="flex items-center gap-2 text-sm text-muted">
                <Mail className="h-4 w-4" /> Current: <span className="font-medium text-ink">{user?.email}</span>
            </p>
            <TextField
                label="New email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((er) => removeError('email', er));
                }}
                error={errors.email}
            />
            <Button type="submit" variant="secondary" loading={loading} className="self-start">
                Send verification code
            </Button>
        </form>
    );
};

const AccountSettingCard = () => {
    const user = useCurrentUser();
    return (
        <div className="flex flex-col gap-6">
            <SettingsSection title="Profile" text="Your name and photo appear in the menu and on your saved designs.">
                <ProfileForm />
            </SettingsSection>
            {!user?.isGuest && (
                <SettingsSection title="Email address" text="We'll send a code to the new address. Your email only changes once you confirm it.">
                    <EmailForm />
                </SettingsSection>
            )}
        </div>
    );
};

export default AccountSettingCard;
