import { Link } from 'react-router-dom';
import Spinner from '../Spinner';

const variants = {
    primary: 'bg-clay text-paper hover:bg-clay-dark shadow-soft',
    dark: 'bg-ink text-paper hover:bg-ink/90',
    secondary: 'border border-ink/15 bg-paper text-ink hover:border-ink/30 hover:bg-white',
    ghost: 'text-ink hover:bg-sand/70',
    danger: 'bg-danger text-white hover:bg-danger/90',
    'danger-outline': 'border border-danger/30 text-danger hover:bg-danger-light',
};

const sizes = {
    sm: 'h-9 px-3.5 text-sm gap-1.5',
    md: 'h-11 px-5 text-[15px] gap-2',
    lg: 'h-14 px-7 text-base gap-2.5',
};

const Button = ({
    children,
    name, // kept for older call sites
    variant = 'primary',
    size = 'md',
    to,
    href,
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    type = 'button',
    ...rest
}) => {
    const classes = [
        'inline-flex select-none items-center justify-center rounded-full font-medium transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth ? 'w-full' : '',
        className,
    ].join(' ');

    const content = (
        <>
            {loading ? <Spinner size="sm" /> : Icon && <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />}
            <span>{children ?? name}</span>
            {IconRight && !loading && <IconRight aria-hidden="true" className="h-4 w-4 shrink-0" />}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={classes} {...rest}>
                {content}
            </Link>
        );
    }
    if (href) {
        return (
            <a href={href} className={classes} {...rest}>
                {content}
            </a>
        );
    }
    return (
        <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading} {...rest}>
            {content}
        </button>
    );
};

export default Button;
