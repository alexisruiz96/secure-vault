import { createContext, useState, useContext } from "react";
import * as secureVaultApi from '../api/axios'
interface Props {
    children: React.ReactNode;
}

const AuthContext: React.Context<any> = createContext(null);

export const useAuth = () =>{
    const auth = useContext(AuthContext);
    if(!auth){
        throw new Error('useAuth must be used within a AuthProvider'); 
    }
    return auth;
}

export const AuthProvider: React.FC<Props> = ({children}:Props) => {
    
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (details: any) => {
        setLoading(true);
        const response = await secureVaultApi.login(details);
        if (response.status === 200) {
            setUser(response.data);
            setIsAuthenticated(true);
        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
        setLoading(false);
    }

    const logout = () => {
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, user, login, logout, loading, error}}>
            {children}
        </AuthContext.Provider>
    );
}