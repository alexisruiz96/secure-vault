import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { UserType } from '../models/interfaces/User';

interface Props {
    children: React.ReactNode[] | React.ReactNode;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    user: UserType;
    login: (user: UserType) => void;
    logout: () => void;
    error: string;
};

const defaultUser = { username: "", password: "", email: "" };
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: defaultUser,
    login: (user: UserType) => {},
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
    const [user, setUser] = useState<UserType>({
        username: "",
        password: "",
        email: "",
    });
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    const login = async (details: UserType) => {
        debugger;
        const response = await secureVaultApi.login(details);
        if (response.status === 200) {
            setUser({
                username: response.data.username,
                password: "",
                email: "",
            });
            setIsAuthenticated(true);
        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultUser);
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
