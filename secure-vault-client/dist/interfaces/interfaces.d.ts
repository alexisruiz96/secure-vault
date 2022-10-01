export interface User {
    username: string;
    password: string;
    epochtime: EpochTimeStamp;
    data: string;
    email: string;
}
export interface ILoginUser {
    username: string;
    password: string;
}
export interface IApiOptions {
    baseUrl: string;
    timeout: number;
}
export interface IKeyPrefixes {
    authKey: string;
    encKey: string;
}
export interface ICryptoOptions {
    format: "pkcs8" | "raw" | "spki";
    algorithm: "AES-CTR" | "AES-CBC" | "AES-GCM" | "AES-KW";
}
export declare type VaultKey = string | ArrayBuffer;
export interface IStorage {
    username: string;
    timestamp: EpochTimeStamp;
    storage: any;
}
