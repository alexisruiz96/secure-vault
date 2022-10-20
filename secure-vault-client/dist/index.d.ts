import { AxiosResponse } from "axios";
import { IApiOptions, ICryptoOptions, IKeyPrefixes, ILoginUser, User } from "./interfaces/interfaces";
import { EventSourcePolyfill } from "event-source-polyfill";
export interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
}
export interface StorageContainer {
    epochtime: number;
    data: string;
}
export declare class SecureVaultClient {
    private _options;
    private _initialized;
    private _cryptoUtil;
    private _apiClient;
    private _username;
    constructor(options: Options);
    initialize(user: ILoginUser): Promise<AxiosResponse>;
    signUp(user: User): Promise<number>;
    /**
     * Logins secure vault client
     * @param user
     * @returns login status
     */
    login(user: ILoginUser): Promise<AxiosResponse>;
    logout(): Promise<void>;
    getStorage(): Promise<AxiosResponse>;
    setStorage(storage: File, lastEpochRegistered: string): Promise<AxiosResponse>;
    downloadStorageToDisk(): Promise<void>;
    subscribeStorage(): Promise<EventSourcePolyfill>;
    unsubscribeStorage(eventSource: EventSourcePolyfill): Promise<void>;
    getReadableStorage(response: any): Promise<StorageContainer>;
    private checkAppendedFormData;
}
