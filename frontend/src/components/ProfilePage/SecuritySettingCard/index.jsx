import { useState } from 'react';
import { TriangleAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal, TextField } from '../../shared';
import { SettingsSection } from '../AccountSettingCard';
import { getErrorMessage, removeError, rules, validate } from '../../../helpers/GlobalMethods';
import { useCurrentUser, useSignOut } from '../../../utils/utils';
import axios from '../../../redux/https';
import { endPoints } from '../../../redux/constants';

const emptyPasswords = { currentPassword: '', newPassword: '', confirmPassword: '' };

const PasswordForm = () => {
    const [form, setForm] = useState(emptyPasswords);
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
            currentPassword: [rules.required('Current password')],
            newPassword: [
                rules.required('New password'),
                rules.minLength(8, 'Password'),
                (value, values) => (value && value === values.currentPassword ? 'Choose a password you have not used here' : ''),
            ],
            confirmPassword: [rules.required(null, 'Please confirm your password'), rules.matches('newPassword', 'Passwords do not match')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        setLoading(true);
        try {
            await axios.post(endPoints.changePassword, { currentPassword: form.currentPassword, newPassword: form.newPassword });
            setForm(emptyPasswords);
            toast.success('Password changed.');
        } catch (err) {
            if (err?.response?.data?.code === 'WRONG_PASSWORD') {
                setErrors({ currentPassword: 'Current password is incorrect' });
            } else {
                toast.error(getErrorMessage(err));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <TextField label="Current password" name="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={onChange} error={errors.currentPassword} />
            <TextField label="New password" name="newPassword" type="password" autoComplete="new-password" value={form.newPassword} onChange={onChange} error={errors.newPassword} hint="At least 8 characters" />
            <TextField label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
            <Button type="submit" loading={loading} className="self-start">
                Update password
            </Button>
        </form>
    );
};

const DeleteAccount = () => {
    const signOut = useSignOut();
    const isGuest = Boolean(useCurrentUser()?.isGuest);
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const close = () => {
        if (loading) return;
        setOpen(false);
        setPassword('');
        setError('');
    };

    const onDelete = async (event) => {
        event.preventDefault();
        if (!isGuest && !password) return setError('Enter your password to confirm');
        setLoading(true);
        try {
            await axios.delete(endPoints.deleteUser, { data: isGuest ? {} : { password } });
            signOut('/');
            toast.success('Your account and designs have been deleted.');
        } catch (err) {
            setError(err?.response?.data?.code === 'WRONG_PASSWORD' ? 'Password is incorrect' : getErrorMessage(err));
            setLoading(false);
        }
    };

    return (
        <>
            <div className="rounded-2xl border border-danger/20 bg-danger-light/50 p-5">
                <p className="flex items-start gap-2.5 text-sm text-ink">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                    Deleting your account removes your profile, photo, every saved design and its images. This can't be undone.
                </p>
                <Button variant="danger-outline" icon={Trash2} className="mt-4" onClick={() => setOpen(true)}>
                    Delete my account
                </Button>
            </div>
            <Modal open={open} onClose={close} title="Delete your account?" size="sm">
                <form onSubmit={onDelete} noValidate className="flex flex-col gap-5">
                    <p className="text-muted">
                        {isGuest ? 'Your guest account and its designs will be deleted now.' : 'Enter your password to confirm. Your designs will be deleted too.'}
                    </p>
                    {!isGuest && (
                    <TextField
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        error={error}
                        autoFocus
                    />
                    )}
                    {isGuest && error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={close} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="danger" icon={Trash2} loading={loading}>
                            Delete account
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

const SecuritySettingCard = () => {
    const isGuest = Boolean(useCurrentUser()?.isGuest);
    return (
        <div className="flex flex-col gap-6">
            {!isGuest && (
                <SettingsSection title="Password" text="Use at least 8 characters. A long phrase is easier to remember and harder to guess.">
                    <PasswordForm />
                </SettingsSection>
            )}
            <SettingsSection
                title={isGuest ? 'Delete guest account' : 'Delete account'}
                text={isGuest ? 'Guest accounts are deleted automatically after 24 hours. You can also delete it now.' : 'Permanently remove your Redecor AI account.'}
            >
                <DeleteAccount />
            </SettingsSection>
        </div>
    );
};

export default SecuritySettingCard;
