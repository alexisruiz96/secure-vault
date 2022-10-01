import { User, ILoginUser, IKeyPrefixes, ICryptoOptions, IApiOptions } from "./interfaces/interfaces";
import { AxiosResponse } from "axios";
export interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
}
export declare class SecureVaultClient {
    private _options;
    private _initialized;
    private _cryptoUtil;
    private _apiClient;
    private _username;
    constructor(options: Options);
    initialize(user: ILoginUser): Promise<AxiosResponse>;
    signUp(user: User): Promise<void>;
    /**
     * Logins secure vault client
     * @param user
     * @returns login status
     */
    login(user: ILoginUser): Promise<AxiosResponse>;
    logout(): Promise<void>;
    getStorage(): Promise<void>;
    setStorage(storage: any | File): Promise<AxiosResponse['data']>;
    downloadStorageToDisk(downloadUrl: string): Promise<void>;
    private checkAppendedFormData;
}
