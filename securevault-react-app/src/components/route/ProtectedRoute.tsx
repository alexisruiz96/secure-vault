import { Navigate, Route, RouteProps, Routes, useLocation } from 'react-router-dom';

import { useAuth } from '../../api/auth';

interface Props extends RouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<Props> = ({ children }: Props) => {
    debugger;
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <Routes>
            <Route path={location.pathname} element={children}></Route>
        </Routes>
    );
};
