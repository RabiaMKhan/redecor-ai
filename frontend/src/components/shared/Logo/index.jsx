import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
        <rect width="32" height="32" rx="8" className="fill-clay" />
        <path d="M9.5 24.5V15a6.5 6.5 0 0 1 13 0v9.5" fill="none" stroke="#F6F1EA" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="16" cy="15.6" r="2.1" fill="#F6F1EA" />
        <path d="M6.5 24.5h19" stroke="#F6F1EA" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
);

const Logo = ({ tone = 'dark', onClick }) => (
    <Link to="/" onClick={onClick} className="group inline-flex items-center gap-2.5" aria-label="Redecor AI home">
        <LogoMark className="h-8 w-8 transition-transform duration-300 group-hover:-rotate-6" />
        <span className={`font-display text-[22px] font-medium tracking-tight ${tone === 'light' ? 'text-paper' : 'text-ink'}`}>
            Redecor
        </span>
        <span className={`-ml-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ${tone === 'light' ? 'bg-paper/15 text-paper' : 'bg-clay-light text-clay-dark'}`}>
            AI
        </span>
    </Link>
);

export default Logo;
