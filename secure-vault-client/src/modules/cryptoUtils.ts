import * as scryptPbkdf from "scrypt-pbkdf";
import * as base64 from "@juanelas/base64";

import { ICryptoOptions } from "../interfaces/interfaces";

interface EncryptedData {
    base64IV: string;
    base64Data: string;
}

export class CryptoUtil {
    private _options: ICryptoOptions;
    private _encCryptoKey?: string;
    readonly _subtleCrypto = window.crypto.subtle;

    constructor(options: ICryptoOptions) {
        this._options = options;
    }

    /**
     * Generate key using KDF with scrypt
     * @param {string} password introduced password by user
     * @param {boolean} base64Format if true, the key will be returned in base64 format
     * @returns {ArrayBuffer} generated key
     */
    //TODO pass keyLength as parameter
    async generateKey(
        password: string,
        base64Format: boolean
    ): Promise<string | ArrayBuffer> {
        const salt: ArrayBuffer = await this.generateFixedSalt(password);
        const derivedKeyLength = 32; // in bytes
        const key = await scryptPbkdf.scrypt(password, salt, derivedKeyLength); // key is an ArrayBuffer

        if (base64Format) {
            return this.convertBufferToBase64(key);
        }

        return key;
    }

    /**
     * Generate fixed salt, it has to be the same to check the key later
     * @param {string} password password introduced by user
     * @returns
     */
    //TODO: pass algorithm as parameter
    async generateFixedSalt(password: string) {
        const hash: ArrayBuffer = (await this.generatePasswordHash(
            password,
            "SHA-256",
            false
        )) as unknown as ArrayBuffer;
        return hash.slice(16);
    }

    /**
     * Generate fixed salt, it has to be the same to check the key later
     * @param {string} password password introduced by user
     * @param {string} algorithm used to generate the hash
     * @param {boolean} base64Format indicates if the output is in base64 format
     * @returns
     */
    //TODO: pass algorithm and if return value in base64 or ArrayBuffer
    async generatePasswordHash(
        password: string,
        algorithm: string,
        base64Format: boolean
    ): Promise<string | ArrayBuffer> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await this._subtleCrypto.digest(algorithm, data);
        if (base64Format) {
            return this.convertBufferToBase64(hash);
        }
        return hash;
    }

    /**
     * Generate CryptoKey object with SubtleCrypto
     * @param {string} keyData Key passed as string encoded with base64
     * @returns {string} CryptoKey object stringified
     */
    //TODO: pass keyusage as param
    //TODO: pass algorithm as param
    //TODO: pass extractable as param
    async generateCryptoKey(keyData: string): Promise<string> {
        let keyDataDecoded: string | Uint8Array =
            this.convertBase64ToBuffer(keyData);
        let cryptoKey: CryptoKey;
        let actions: KeyUsage[] = ["encrypt", "decrypt"];
        if (typeof keyDataDecoded === "string") {
            keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
        }
        let jsonWebKey: string = "";
        try {
            cryptoKey = await this._subtleCrypto.importKey(
                this._options.format,
                keyDataDecoded,
                {
                    name: this._options.algorithm,
                },
                true,
                actions
            );
            const exportedKey:JsonWebKey = await this._subtleCrypto.exportKey(
                "jwk",
                cryptoKey
            );
            jsonWebKey = JSON.stringify(exportedKey);
            //console.log(cryptoKeyGlobal)
        } catch (error) {
            console.error("Error generating CryptoKey: " + error);
        }
        return jsonWebKey;
    }

    /**
     * Encrypt data passing cryptoKey and data
     * @param {string} cryptoKeyJwk
     * @returns {JSON} Returns IV and data encrypted
     */
    //TODO: pass algorithm as param
    //TODO: pass cryptoKey as string or ArrayBuffer
    async encryptData(cryptoKeyJwk: string, data: ArrayBuffer) {
        const cryptoKey = await this.convertJwkToCryptoKey(
            cryptoKeyJwk,
            this._options.algorithm
        );

        const iv = crypto.getRandomValues(new Uint8Array(12));
        let ciphertext: ArrayBuffer;

        try {
            ciphertext = await this._subtleCrypto.encrypt(
                {
                    name: this._options.algorithm,
                    iv,
                },
                cryptoKey,
                data
            );

            //TODO Check to return data as ArrayBuffer
            //TODO epochtime
            const base64IV = this.convertBufferToBase64(iv);
            const base64Data = this.convertBufferToBase64(ciphertext);
            const encryptedObject = {
                base64IV,
                base64Data,
            };
            return this.formatEncryptedData(encryptedObject);
        } catch (error) {
            console.error("Error encrypting data: " + error);
        }
    }

    /**
     * Pass JsonWebKey to CryptoKey and decrypt data
     * @param {string} userCryptoKey JsonWebKey stringified
     * @param {ArrayBuffer} encryptedData Encrypted binary data
     * @param {string} dataIV used to encrypt data
     */
    //TODO: pass algorithm as param
    async decryptData(
        userCryptoKey: string,
        encryptedData: ArrayBuffer,
        dataIV: string
    ) {
        const cryptoKey = await this.convertJwkToCryptoKey(
            userCryptoKey,
            this._options.algorithm
        );
        const iv = this.convertBase64ToBuffer(dataIV) as Uint8Array;

        if (iv instanceof Uint8Array && encryptedData instanceof Uint8Array) {
            try {
                return await this._subtleCrypto.decrypt(
                    {
                        name: "AES-GCM",
                        iv: iv,
                    },
                    cryptoKey,
                    encryptedData
                );
            } catch (error) {
                debugger;
                let errorMessage = "Failed authentication.";
                if (error instanceof Error) {
                    if (error.toString() === "Error: Cipher job failed") {
                        console.error("Error: Wrong password!!!");
                    } else {
                        console.error("Error decrypting data: " + error);
                    }
                }
                console.log(errorMessage);
            }
        } else {
            console.error("Error datatype during IV and Cipher processing.");
        }
    }

    convertBufferToBase64(data: ArrayBuffer) {
        return base64.encode(data, true, false);
    }

    convertBase64ToBuffer(data: string) {
        return base64.decode(data);
    }

    /**
     * Import CryptoKey in jwk format
     * format, keyData, algorithm, extractable, keyUsages
     * @param {string} jwk JSON Web Key
     * @param {string} algorithm
     */
    async convertJwkToCryptoKey(jwk: string, algorithm: string) {
        const jwkParsed: JsonWebKey = JSON.parse(jwk);
        let keyDataDecoded = this.convertBase64ToBuffer(jwkParsed.k!);
        if (typeof keyDataDecoded === "string") {
            keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
        }
        return this._subtleCrypto.importKey(
            "raw",
            keyDataDecoded,
            {
                name: algorithm,
            },
            jwkParsed.ext!,
            jwkParsed.key_ops as KeyUsage[]
        );
    }

    formatEncryptedData(encryptedObject: EncryptedData) {
        const data = [];
        data.push({
            iv: encryptedObject.base64IV,
            encryptedData: encryptedObject.base64Data,
        });
        return JSON.stringify(data);
    }

    //GETTERS & SETTERS
    public get encCryptoKey(): string | undefined {
        return this._encCryptoKey;
    }
    public set encCryptoKey(value: string | undefined) {
        this._encCryptoKey = value;
    }
}
