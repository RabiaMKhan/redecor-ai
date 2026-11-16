import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, Menu, Sparkles, User, X, FolderHeart } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../Logo';
import Button from '../Button';
import Avatar from '../Avatar';
import { accountLabel, useCurrentUser, useSignOut } from '../../../utils/utils';

const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/ai', label: 'Studio' },
    { to: '/gallery', label: 'Gallery' },
    { to: '/about', label: 'About' },
    { to: '/contact-us', label: 'Contact' },
];

const linkClass = ({ isActive }) =>
    `relative rounded-full px-3.5 py-2 text-[15px] transition-colors ${isActive ? 'text-ink after:absolute after:inset-x-3.5 after:-bottom-0.5 after:h-px after:bg-clay' : 'text-muted hover:text-ink'
    }`;

const Navbar = () => {
    const user = useCurrentUser();
    const isAuthenticated = Boolean(user?.accessToken);
    const signOut = useSignOut();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        setMobileOpen(false);
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const onClick = (event) => !menuRef.current?.contains(event.target) && setMenuOpen(false);
        const onKey = (event) => event.key === 'Escape' && setMenuOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [menuOpen]);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const handleLogout = () => {
        signOut('/');
        toast.success('You are signed out.');
    };

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-colors duration-300 ${scrolled || mobileOpen ? 'border-line bg-cream/90 backdrop-blur-md' : 'border-transparent bg-cream'
                }`}
        >
            <nav className="container-page flex h-[72px] items-center justify-between gap-4" aria-label="Main">
                <Logo />

                <div className="hidden items-center gap-1 md:flex">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    {isAuthenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="flex items-center gap-2.5 rounded-full border border-line bg-paper py-1 pl-1 pr-3.5 text-sm font-medium text-ink transition-colors hover:border-ink/25"
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                            >
                                <Avatar src={user?.profileImage} name={user?.username} size="sm" className="!h-8 !w-8 !ring-0" />
                                <span className="max-w-[120px] truncate">{user?.username}</span>
                            </button>
                            {menuOpen && (
                                <div role="menu" className="absolute right-0 mt-2 w-56 animate-fade-up overflow-hidden rounded-2xl border border-line bg-paper p-1.5 shadow-lift">
                                    <p className="truncate px-3 pb-2 pt-1.5 text-xs text-muted">{accountLabel(user)}</p>
                                    <NavLink role="menuitem" to="/profile" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-sand/70">
                                        <FolderHeart className="h-4 w-4 text-muted" /> My designs
                                    </NavLink>
                                    <NavLink role="menuitem" to="/profile?tab=account" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-sand/70">
                                        <User className="h-4 w-4 text-muted" /> Account settings
                                    </NavLink>
                                    <button role="menuitem" type="button" onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-sand/70">
                                        <LogOut className="h-4 w-4 text-muted" /> Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Button to="/login" variant="ghost" size="sm">
                                Sign in
                            </Button>
                            <Button to="/ai" size="sm" icon={Sparkles}>
                                Analyse a room
                            </Button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand md:hidden"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </nav>

            {mobileOpen && (
                <div className="h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-cream md:hidden">
                    <div className="container-page flex flex-col gap-1 py-6">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={({ isActive }) => `rounded-2xl px-4 py-3 font-display text-2xl ${isActive ? 'bg-sand text-ink' : 'text-ink/80'}`}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-3 px-1 pb-2">
                                        <Avatar src={user?.profileImage} name={user?.username} size="md" />
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">{user?.username}</p>
                                            <p className="truncate text-sm text-muted">{accountLabel(user)}</p>
                                        </div>
                                    </div>
                                    <Button to="/profile" variant="secondary" icon={FolderHeart} fullWidth>
                                        My designs
                                    </Button>
                                    <Button variant="ghost" icon={LogOut} onClick={handleLogout} fullWidth>
                                        Sign out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button to="/ai" icon={Sparkles} fullWidth>
                                        Analyse a room
                                    </Button>
                                    <Button to="/login" variant="secondary" fullWidth>
                                        Sign in
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
