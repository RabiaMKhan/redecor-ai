import { useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/actions/userActions';

// Where people land after signing in (unless they came from a protected page).
// PublicRoutes and LoginPage both use it, so their redirects never disagree.
export const AFTER_LOGIN_PATH = '/ai';

export const useCurrentUser = () => useSelector((state) => state?.user?.currentUser);

// Guests get a random @guest.redecor.ai email; show this instead
export const accountLabel = (user) => (user?.isGuest ? 'Guest account · deleted after 24 hours' : user?.email);

export const useIsAuthentication = () => Boolean(useCurrentUser()?.accessToken);

export const usePageTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} · Redecor AI` : 'Redecor AI - see your room redesigned';
    }, [title]);
};

// Sign out and leave the page.
// Redux re-renders synchronously, so if we cleared the user first, a protected page
// would see "signed out" and redirect to /login before our navigate() lands.
// flushSync commits the navigation first, then the user is cleared.
export const useSignOut = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    return useCallback(
        (to = '/') => {
            flushSync(() => navigate(to, { replace: true }));
            dispatch(logout());
        },
        [navigate, dispatch]
    );
};
