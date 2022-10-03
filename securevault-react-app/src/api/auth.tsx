import { AxiosResponse } from 'axios';
import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { secureVault } from '../index';
import { ILoginUser } from '../models/interfaces/interfaces';
import { i18n } from '../i18n/i18n';

interface Props {
    children: React.ReactNode[] | React.ReactNode;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    user: ILoginUser;
    login: (user: ILoginUser) => void;
    logout: () => void;
    error: string;
};

const defaultIUserLogin = { username: "", password: "", salt: "" };
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: defaultIUserLogin,
    login: (_user: ILoginUser) => {},
    logout: () => {},
    error: "",
};

export const AuthContext = createContext<AuthContextType | null>(
    defaultContext
);

export const useAuth = () => {
    const auth = useContext(AuthContext);
    if (auth === null) {
        throw new Error(i18n.auth_error);
    }

    return auth;
};

export const AuthProvider: React.FC<Props> = ({ children }: Props) => {
    const [user, setUser] = useState<ILoginUser>({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const login = async (details: ILoginUser) => {
        const newLoginUser = { ...details };

        const response: AxiosResponse = await secureVault.initialize({
            username: newLoginUser.username,
            password: newLoginUser.password,
        });

        if (response.status === 200) {
            setUser({
                username: response.data.username,
                password: "",
            });
            //TODO: authenticate with jwt
            setIsAuthenticated(true);
        } else if (response.status === 401) {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultIUserLogin);
        secureVault.logout();
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
