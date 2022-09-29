import { ILoginUser, IKeyPrefixes, ICryptoOptions, IApiOptions } from './interfaces/interfaces';
import { AxiosResponse } from 'axios';
interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
}
export declare class SecureVaultClient {
    private _options;
    private _encKey?;
    private _auth_token?;
    private _initialized;
    private _cryptoUtil;
    private _apiClient;
    constructor(options: Options);
    initialize(user: ILoginUser): Promise<AxiosResponse>;
    signUp(username: string, password: string, email: string): Promise<void>;
    /**
     * Logins secure vault client
     * @param user
     * @returns login status
     */
    login(user: ILoginUser): Promise<AxiosResponse>;
    logout(): Promise<void>;
    getStorage(): Promise<void>;
    setStorage(storage: any): Promise<void>;
}
export {};
