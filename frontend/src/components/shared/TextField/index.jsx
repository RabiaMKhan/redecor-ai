import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const baseInput =
    'w-full rounded-xl border bg-paper px-4 text-[15px] text-ink placeholder:text-muted/70 transition-colors focus:outline-none focus:ring-2 focus:ring-clay/25 disabled:opacity-60';

const TextField = forwardRef(
    ({ label, error, hint, type = 'text', multiline = false, rows = 4, className = '', id, ...rest }, ref) => {
        const autoId = useId();
        const inputId = id || autoId;
        const [visible, setVisible] = useState(false);
        const isPassword = type === 'password';
        const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
        const border = error ? 'border-danger focus:border-danger' : 'border-ink/15 focus:border-clay';

        return (
            <div className={`flex flex-col gap-1.5 ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-ink">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {multiline ? (
                        <textarea
                            ref={ref}
                            id={inputId}
                            rows={rows}
                            aria-invalid={Boolean(error)}
                            aria-describedby={describedBy}
                            className={`${baseInput} ${border} resize-y py-3`}
                            {...rest}
                        />
                    ) : (
                        <input
                            ref={ref}
                            id={inputId}
                            type={isPassword && visible ? 'text' : type}
                            aria-invalid={Boolean(error)}
                            aria-describedby={describedBy}
                            className={`${baseInput} ${border} h-12 ${isPassword ? 'pr-12' : ''}`}
                            {...rest}
                        />
                    )}
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setVisible((v) => !v)}
                            className="absolute inset-y-0 right-1 my-1 flex w-10 items-center justify-center rounded-lg text-muted hover:text-ink"
                            aria-label={visible ? 'Hide password' : 'Show password'}
                        >
                            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                        </button>
                    )}
                </div>
                {error ? (
                    <p id={`${inputId}-error`} className="text-sm text-danger">
                        {error}
                    </p>
                ) : (
                    hint && (
                        <p id={`${inputId}-hint`} className="text-sm text-muted">
                            {hint}
                        </p>
                    )
                )}
            </div>
        );
    }
);

TextField.displayName = 'TextField';

export default TextField;
