import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { IUserLogin, VaultKey } from "../models/interfaces/Interfaces";
import * as CryptoUtil from "../modules/CryptoUtils";
import { prefixSubKeys } from '../modules/config';

interface Props {
    children: React.ReactNode[] | React.ReactNode;
}

export type AuthContextType = {
    isAuthenticated: boolean;
    user: IUserLogin;
    login: (user: IUserLogin) => void;
    logout: () => void;
    userCryptoKey: string;
    error: string;
};

const defaultIUserLogin = { username: "", password: "", salt: "" };
const defaultContext: AuthContextType = {
    isAuthenticated: false,
    user: defaultIUserLogin,
    login: (_user: IUserLogin) => { /* TODO document why this method 'login' is empty */ },
    logout: () => {/* TODO document why this method 'logout' is empty */},
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
    const [user, setUser] = useState<IUserLogin>({
        username: "",
        password: "",
        salt: "",
    });
    const [error, setError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userCryptoKey, setUserCryptoKey] = useState<string>("");
    const navigate = useNavigate();

    const login = async (details: IUserLogin) => {
        debugger;
        const newDetails = { ...details };
        const saltResponse = await secureVaultApi.getUserSalt(newDetails.username);
        
        const passwordScrypt = await CryptoUtil.generateKey(
            prefixSubKeys.authKey + newDetails.password,
            saltResponse.data.salt
        );

        
        newDetails.salt = saltResponse.data.salt;
        newDetails.password = passwordScrypt.base64Pwd;
        
        const response = await secureVaultApi.login(newDetails);
        if (response.status === 200) {
            
            setUser({
                username: response.data.username,
                password: "",
                salt: "",
            });
            setIsAuthenticated(true);

            //Generate encryption key
            generateEncryptionKey(details.password, saltResponse.data.salt);
        } else {
            setError(response.data);
            setIsAuthenticated(false);
        }
    };

    const logout = () => {
        setUser(defaultIUserLogin);
        navigate("/login");
    };

    const generateEncryptionKey = async (password: string, salt:string) => {
        CryptoUtil.generateKey(
            prefixSubKeys.encKey + password,
            salt
        ).then((key: VaultKey) => {
            CryptoUtil.generateCryptoKey(key.base64Pwd)
            .then((cryptoKeyRes: string) => {
                setUserCryptoKey(cryptoKeyRes);
            });
        });

    }

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, user, login, logout, error, userCryptoKey }}
        >
            {children}
        </AuthContext.Provider>
    );
};
