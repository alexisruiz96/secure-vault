import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { ILoginUser } from '../models/interfaces/interfaces';
import { VaultKey } from '../models/types/types';
import { prefixSubKeys } from '../modules/config';
import * as CryptoUtil from '../modules/CryptoUtils';

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

        const authKey = await CryptoUtil.generateKey(
            prefixSubKeys.authKey + newLoginUser.password,
            true
        );

        newLoginUser.password = authKey as string;
        
        const response = await secureVaultApi.login(newLoginUser);
        if (response.status === 200) {
            setUser({
                username: response.data.username,
                password: "",
            });
            //TODO: authenticate with jwt
            setIsAuthenticated(true);

            //TODO: check to generate it here and only once
            //Generate encryption key
            generateCryptoKey(details.password);
        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultIUserLogin);
        navigate("/login");
    };

    const generateCryptoKey = async (password: string) => {
        CryptoUtil.generateKey(prefixSubKeys.encKey + password, true).then(
            (key: VaultKey) => {
                CryptoUtil.generateCryptoKey(key as string).then(
                    (cryptoKeyRes: string) => {
                        setUserCryptoKey(cryptoKeyRes);
                    }
                );
            }
        );
    };

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
