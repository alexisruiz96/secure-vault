import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { IUserLogin } from "../models/interfaces/Interfaces";

interface Props {
    children: React.ReactNode[] | React.ReactNode;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    user: IUserLogin;
    login: (user: IUserLogin) => void;
    logout: () => void;
    error: string;
};

const defaultIUserLogin = { username: "", password: "", salt: "" };
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: defaultIUserLogin,
    login: (_user: IUserLogin) => {},
    logout: () => {},
    error: "",
};

export const AuthContext = createContext<AuthContextType | null>(
    defaultContext
);

export const useAuth = () => {
    const auth = useContext(AuthContext);
    if (auth === null) {
        throw new Error("useAuth must be used within a AuthProvider");
    }

    return auth;
};

export const AuthProvider: React.FC<Props> = ({ children }: Props) => {
    const [user, setUser] = useState<IUserLogin>({
        username: "",
        password: "",
        salt: "",
    });
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const login = async (details: IUserLogin) => {
        debugger;
        const response = await secureVaultApi.login(details);
        if (response.status === 200) {
            setUser({
                username: response.data.username,
                password: "",
                salt: "",
            });
            setIsAuthenticated(true);
        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultIUserLogin);
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, user, login, logout, error }}
        >
            {children}
        </AuthContext.Provider>
    );
};
