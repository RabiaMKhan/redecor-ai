// Library Imports
import { Route, Routes } from 'react-router-dom';

// Local Imports
import PublicRoutes from './PublicRoutes';
import ProtectedRoutes from './ProtectedRoutes';
import { openRoutes, protectedRoutes, publicRoutes } from './Config';

export default function Routing() {
    return (
        <Routes>
            {/* paths match case-insensitively, so the old /AI link still opens /ai */}
            <Route element={<PublicRoutes />}>
                {publicRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>
            <Route element={<ProtectedRoutes />}>
                {protectedRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>
            {openRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
            ))}
        </Routes>
    );
}
