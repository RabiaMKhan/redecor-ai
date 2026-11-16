import Layout from '../components/shared/Layout';
import About from '../pages/About';
import AI from '../pages/AI';
import ContactUs from '../pages/ContactUS';
import DesignPage from '../pages/Design';
import ForgetPassword from '../pages/ForgetPassword';
import Gallery from '../pages/Gallery';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import NotFound from '../pages/NotFound';
import ProfilePage from '../pages/ProfilePage';
import SignupPage from '../pages/SignupPage';
import VerifyEmail from '../pages/VerifyEmail';

// Anyone can open these
export const openRoutes = [
    { path: '/', element: <Layout><HomePage /></Layout> },
    { path: '/ai', element: <Layout><AI /></Layout> },
    { path: '/gallery', element: <Layout><Gallery /></Layout> },
    { path: '/about', element: <Layout><About /></Layout> },
    { path: '/contact-us', element: <Layout><ContactUs /></Layout> },
    { path: '/verify-email', element: <VerifyEmail /> },
    { path: '/forget-password', element: <ForgetPassword /> },
    { path: '*', element: <Layout><NotFound /></Layout> },
];

// Only for signed-out visitors (signed-in users are sent on)
export const publicRoutes = [
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
];

// Only for signed-in users
export const protectedRoutes = [
    { path: '/profile', element: <Layout><ProfilePage /></Layout> },
    { path: '/designs/:id', element: <Layout><DesignPage /></Layout> },
];
