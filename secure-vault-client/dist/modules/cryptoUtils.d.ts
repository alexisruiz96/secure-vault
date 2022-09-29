import { ICryptoOptions } from "../interfaces/interfaces";
interface EncryptedData {
    base64IV: string;
    base64Data: string;
}
export declare class CryptoUtil {
    private _options;
    private _encCryptoKey?;
    readonly _subtleCrypto: SubtleCrypto;
    constructor(options: ICryptoOptions);
    /**
     * Generate key using KDF with scrypt
     * @param {string} password introduced password by user
     * @param {boolean} base64Format if true, the key will be returned in base64 format
     * @returns {ArrayBuffer} generated key
     */
    generateKey(password: string, base64Format: boolean): Promise<string | ArrayBuffer>;
    /**
     * Generate fixed salt, it has to be the same to check the key later
     * @param {string} password password introduced by user
     * @returns
     */
    generateFixedSalt(password: string): Promise<ArrayBuffer>;
    /**
     * Generate fixed salt, it has to be the same to check the key later
     * @param {string} password password introduced by user
     * @param {string} algorithm used to generate the hash
     * @param {boolean} base64Format indicates if the output is in base64 format
     * @returns
     */
    generatePasswordHash(password: string, algorithm: string, base64Format: boolean): Promise<string | ArrayBuffer>;
    /**
     * Generate CryptoKey object with SubtleCrypto
     * @param {string} keyData Key passed as string encoded with base64
     * @returns {string} CryptoKey object stringified
     */
    generateCryptoKey(keyData: string): Promise<string>;
    /**
     * Encrypt data passing cryptoKey and data
     * @param {string} cryptoKeyJwk
     * @returns {JSON} Returns IV and data encrypted
     */
    encryptData(cryptoKeyJwk: string, data: ArrayBuffer): Promise<string | undefined>;
    /**
     * Pass JsonWebKey to CryptoKey and decrypt data
     * @param {string} userCryptoKey JsonWebKey stringified
     * @param {ArrayBuffer} encryptedData Encrypted binary data
     * @param {string} dataIV used to encrypt data
     */
    decryptData(userCryptoKey: string, encryptedData: ArrayBuffer, dataIV: string): Promise<ArrayBuffer | undefined>;
    convertBufferToBase64(data: ArrayBuffer): string;
    convertBase64ToBuffer(data: string): string | Uint8Array;
    /**
     * Import CryptoKey in jwk format
     * format, keyData, algorithm, extractable, keyUsages
     * @param {string} jwk JSON Web Key
     * @param {string} algorithm
     */
    convertJwkToCryptoKey(jwk: string, algorithm: string): Promise<CryptoKey>;
    formatEncryptedData(encryptedObject: EncryptedData): string;
    get encCryptoKey(): string | undefined;
    set encCryptoKey(value: string | undefined);
}
export {};
