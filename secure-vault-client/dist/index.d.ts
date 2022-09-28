interface Options {
    baseUrl: string;
}
export declare class SecureVaultClient {
    private _options;
    private _encKey?;
    private _auth_token?;
    private _initialized;
    constructor(options: Options);
    initialize(password: string): Promise<void>;
    getStorage(): Promise<void>;
    setStorage(storage: any): Promise<void>;
}
export {};
