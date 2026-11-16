import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../Logo';
import japanese from '../../../assets/images/styles/japanese.webp';

// Split screen used by sign in, sign up, verify email and password reset.
const AuthLayout = ({ title, subtitle, children, footer, image = japanese, quote }) => (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden overflow-hidden lg:block">
            <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute left-10 top-10">
                <Logo tone="light" />
            </div>
            <figure className="absolute inset-x-10 bottom-10 max-w-md text-paper">
                <blockquote className="font-display text-3xl leading-tight">
                    {quote || '“The best rooms have something to say about the people who live in them.”'}
                </blockquote>
                <figcaption className="mt-3 text-sm text-paper/70">Redecor AI</figcaption>
            </figure>
        </aside>

        <div className="flex flex-col px-4 py-6 sm:px-10 lg:px-16">
            <div className="flex items-center justify-between">
                <div className="lg:hidden">
                    <Logo />
                </div>
                <Link to="/" className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
                    <ArrowLeft className="h-4 w-4" /> Back to site
                </Link>
            </div>
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
                <h1 className="font-display text-4xl leading-tight text-ink">{title}</h1>
                {subtitle && <p className="mt-3 text-base leading-relaxed text-muted">{subtitle}</p>}
                <div className="mt-8">{children}</div>
                {footer && <div className="mt-8 text-center text-sm text-muted">{footer}</div>}
            </main>
        </div>
    </div>
);

export default AuthLayout;
