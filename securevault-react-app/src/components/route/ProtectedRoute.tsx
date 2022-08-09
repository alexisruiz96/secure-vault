import { useAuth} from "../../api/auth";
import { Navigate, Routes } from "react-router-dom";
import { RouteProps,Route, useLocation } from 'react-router-dom'
interface Props extends RouteProps{
    children: React.ReactNode;
}

export const ProtectedRoute:React.FC<Props> = ({children}:Props) => {
    debugger;
    const {isAuthenticated} = useAuth();
    const location = useLocation();

    if(!isAuthenticated){
        return <Navigate to="/login" />
    }

    return (
        <Routes>
            <Route path={location.pathname} element={children} ></Route>
        </Routes>         
    )
}