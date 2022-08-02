import { useAuth } from "../../api/auth";
import { Navigate } from "react-router-dom";

interface Props {
    children: React.ReactNode;
}

export const ProtectedRoute:React.FC<Props> = ({children}:Props) => {
    const auth = useAuth();
    return (
        <div>
            {auth.isAuthenticated ? children : <Navigate to="/login"/>}
        </div>
    );
}