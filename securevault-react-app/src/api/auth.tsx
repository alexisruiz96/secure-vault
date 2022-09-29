import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { ILoginUser } from '../models/interfaces/interfaces';
import { VaultKey } from '../models/types/types';
import { prefixSubKeys } from '../modules/config';
import * as CryptoUtil from '../modules/CryptoUtils';

import { secureVault } from '../index';
import { AxiosResponse } from 'axios';

interface Props {
    children: React.ReactNode[] | React.ReactNode;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    user: ILoginUser;
    login: (user: ILoginUser) => void;
    logout: () => void;
    userCryptoKey: string;
    error: string;
};

const defaultIUserLogin = { username: "", password: "", salt: "" };
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: defaultIUserLogin,
    login: (_user: ILoginUser) => {
        /* TODO document why this method 'login' is empty */
    },
    logout: () => {
        /* TODO document why this method 'logout' is empty */
    },
    userCryptoKey: "",
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
    const [user, setUser] = useState<ILoginUser>({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userCryptoKey, setUserCryptoKey] = useState<string>("");
    const navigate = useNavigate();

    const login = async (details: ILoginUser) => {

        const newLoginUser = { ...details };

        //TODO pass it to the library BLOCK
        const response: AxiosResponse = await secureVault.initialize(
            {username: newLoginUser.username, password: newLoginUser.password}
        );

        //TODO pass it to the library BLOCK END

        if (response.status === 200) {
            setUser({
                username: response.data.username,
                password: "",
            });
            //TODO: authenticate with jwt
            setIsAuthenticated(true);

        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultIUserLogin);
        secureVaultApi.logout();
        navigate("/login");
    };

    //TODO pass it to the library BLOCK

    //TODO pass it to the library BLOCK END

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                login,
                logout,
                error,
                userCryptoKey,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
