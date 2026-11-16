import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail } from 'lucide-react';
import Logo from '../Logo';

const columns = [
    {
        title: 'Explore',
        links: [
            { to: '/ai', label: 'Studio' },
            { to: '/gallery', label: 'Style gallery' },
            { to: '/about', label: 'About Redecor AI' },
        ],
    },
    {
        title: 'Account',
        links: [
            { to: '/signup', label: 'Create an account' },
            { to: '/login', label: 'Sign in' },
            { to: '/profile', label: 'My designs' },
        ],
    },
];

const Footer = () => (
    <footer className="mt-24 bg-ink text-paper/80">
        <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div className="flex flex-col gap-4">
                <Logo tone="light" />
                <p className="max-w-xs text-sm leading-relaxed text-paper/60">
                    Show us any corner of your home. Get a clear plan for a better interior, and see the result before you change a thing.
                </p>
            </div>
            {columns.map((column) => (
                <div key={column.title} className="flex flex-col gap-3">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/50">{column.title}</h2>
                    {column.links.map((link) => (
                        <Link key={link.to} to={link.to} className="w-fit text-sm transition-colors hover:text-paper">
                            {link.label}
                        </Link>
                    ))}
                </div>
            ))}
            <div className="flex flex-col gap-3">
                <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/50">Get in touch</h2>
                <a href="mailto:rabiakhandev1@gmail.com" className="flex w-fit items-center gap-2 text-sm hover:text-paper">
                    <Mail className="h-4 w-4" /> rabiakhandev1@gmail.com
                </a>
                <a
                    href="https://github.com/RabiaMKhan"
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-fit items-center gap-1 text-sm hover:text-paper"
                >
                    GitHub <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <Link to="/contact-us" className="w-fit text-sm hover:text-paper">
                    Contact form
                </Link>
            </div>
        </div>
        <div className="border-t border-paper/10">
            <div className="container-page flex flex-col gap-2 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
                <p>© {new Date().getFullYear()} Redecor AI by Rabia Khan.</p>
                <p>Your photos are private to your account and can be deleted any time.</p>
            </div>
        </div>
    </footer>
);

export default Footer;
