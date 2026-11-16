import { useRef } from 'react';

const LENGTH = 6;

// Six single-digit boxes. Supports typing, backspace, arrow keys and pasting a full code.
const OTPInput = ({ value = '', onChange, error, disabled = false, autoFocus = true }) => {
    const inputs = useRef([]);
    const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

    const focus = (index) => inputs.current[Math.max(0, Math.min(LENGTH - 1, index))]?.focus();

    const setDigit = (index, digit) => {
        const next = digits.slice();
        next[index] = digit;
        onChange(next.join('').slice(0, LENGTH));
    };

    const handleChange = (index, event) => {
        const typed = event.target.value.replace(/\D/g, '');
        if (!typed) return;
        if (typed.length > 1) {
            // e.g. browser autofill puts the whole code in one box
            onChange(typed.slice(0, LENGTH));
            focus(typed.length);
            return;
        }
        setDigit(index, typed);
        focus(index + 1);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            if (digits[index]) {
                setDigit(index, '');
            } else {
                setDigit(index - 1, '');
                focus(index - 1);
            }
        } else if (event.key === 'ArrowLeft') {
            focus(index - 1);
        } else if (event.key === 'ArrowRight') {
            focus(index + 1);
        }
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
        if (!pasted) return;
        event.preventDefault();
        onChange(pasted);
        focus(pasted.length);
    };

    return (
        <div>
            <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Verification code">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        inputMode="numeric"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={LENGTH}
                        disabled={disabled}
                        autoFocus={autoFocus && index === 0}
                        aria-label={`Digit ${index + 1}`}
                        aria-invalid={Boolean(error)}
                        className={`h-14 w-full min-w-0 rounded-xl border bg-paper text-center font-display text-2xl text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-clay/25 ${error ? 'border-danger' : 'border-ink/15 focus:border-clay'
                            }`}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
    );
};

export default OTPInput;
