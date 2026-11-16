import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AFTER_LOGIN_PATH, useIsAuthentication } from '../utils/utils';

const PublicRoutes = () => {
    const location = useLocation();
    return useIsAuthentication() ? <Navigate to={location.state?.from || AFTER_LOGIN_PATH} replace /> : <Outlet />;
};

export default PublicRoutes;
