import { useEffect, useState } from 'react';

// "Resend code" link with a cooldown so people don't spam the mail server
const ResendCode = ({ onResend, cooldown = 60, startOnMount = true }) => {
    const [seconds, setSeconds] = useState(startOnMount ? cooldown : 0);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (seconds <= 0) return undefined;
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    }, [seconds]);

    const resend = async () => {
        setSending(true);
        try {
            const ok = await onResend();
            if (ok !== false) setSeconds(cooldown);
        } finally {
            setSending(false);
        }
    };

    return (
        <p className="text-sm text-muted">
            Didn't get it? Check spam, or{' '}
            {seconds > 0 ? (
                <span>resend in {seconds}s</span>
            ) : (
                <button type="button" onClick={resend} disabled={sending} className="font-medium text-clay hover:underline disabled:opacity-60">
                    {sending ? 'sending…' : 'send a new code'}
                </button>
            )}
        </p>
    );
};

export default ResendCode;
