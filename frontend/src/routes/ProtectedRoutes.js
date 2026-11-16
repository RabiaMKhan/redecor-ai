import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthentication } from '../utils/utils';

const ProtectedRoutes = () => {
    const location = useLocation();
    return useIsAuthentication() ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
    );
};

export default ProtectedRoutes;
