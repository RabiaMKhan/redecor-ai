import { useState } from 'react';
import { Clock, Mail, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, TextField } from '../../components/shared';
import { useCurrentUser, usePageTitle } from '../../utils/utils';
import { getErrorMessage, removeError, rules, validate } from '../../helpers/GlobalMethods';
import axios from '../../redux/https';
import { endPoints } from '../../redux/constants';

const MESSAGE_MAX = 2000;

const ContactUs = () => {
    usePageTitle('Contact');
    const user = useCurrentUser();
    const [form, setForm] = useState({ firstName: '', lastName: '', emailAddress: user?.isGuest ? '' : user?.email || '', message: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const onChange = (event) => {
        const { name, value } = event.target;
        setForm((f) => ({ ...f, [name]: value }));
        setErrors((e) => removeError(name, e));
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        const found = validate(form, {
            firstName: [rules.required('First name')],
            lastName: [rules.required('Last name')],
            emailAddress: [rules.required('Email'), rules.email()],
            message: [rules.required('Message'), rules.minLength(10, 'Message'), rules.maxLength(MESSAGE_MAX, 'Message')],
        });
        setErrors(found);
        if (Object.keys(found).length) return;
        setLoading(true);
        try {
            await axios.post(endPoints.sendMessage, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                emailAddress: form.emailAddress.trim(),
                message: form.message.trim(),
            });
            setSent(true);
            toast.success('Message sent. Thank you!');
        } catch (error) {
            toast.error(getErrorMessage(error, 'Your message could not be sent. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-page grid gap-12 pt-10 md:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
                <p className="eyebrow">Contact</p>
                <h1 className="mt-4 font-display text-[44px] leading-[1.05] text-ink sm:text-5xl">Let's talk about your space</h1>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
                    Questions about Redecor AI, feedback on a design, or an idea for a new feature? Send a message and I'll reply by email.
                </p>
                <ul className="mt-10 space-y-5">
                    {[
                        [Mail, 'Email', 'rabiakhandev1@gmail.com'],
                        [Clock, 'Reply time', 'Usually within 2 working days'],
                        [MapPin, 'Based in', 'Lahore, Pakistan'],
                    ].map(([Icon, label, value]) => (
                        <li key={label} className="flex items-center gap-4">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-clay shadow-soft">
                                <Icon className="h-5 w-5" />
                            </span>
                            <span>
                                <span className="block text-sm text-muted">{label}</span>
                                <span className="block text-ink">{value}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card p-6 sm:p-10">
                {sent ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-light text-sage">
                            <Send className="h-6 w-6" />
                        </span>
                        <h2 className="mt-5 font-display text-3xl text-ink">Message sent</h2>
                        <p className="mt-2 max-w-sm text-muted">Thanks, {form.firstName}. I'll get back to you at {form.emailAddress}.</p>
                        <Button
                            variant="secondary"
                            className="mt-8"
                            onClick={() => {
                                setSent(false);
                                setForm((f) => ({ ...f, message: '' }));
                            }}
                        >
                            Send another message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <TextField label="First name" name="firstName" autoComplete="given-name" value={form.firstName} onChange={onChange} error={errors.firstName} />
                            <TextField label="Last name" name="lastName" autoComplete="family-name" value={form.lastName} onChange={onChange} error={errors.lastName} />
                        </div>
                        <TextField label="Email" name="emailAddress" type="email" autoComplete="email" value={form.emailAddress} onChange={onChange} error={errors.emailAddress} />
                        <TextField
                            label="Message"
                            name="message"
                            multiline
                            rows={6}
                            maxLength={MESSAGE_MAX}
                            value={form.message}
                            onChange={onChange}
                            error={errors.message}
                            hint={`${form.message.length}/${MESSAGE_MAX}`}
                        />
                        <Button type="submit" size="lg" icon={Send} loading={loading} className="self-start">
                            Send message
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactUs;
