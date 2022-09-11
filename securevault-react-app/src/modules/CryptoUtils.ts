import * as scryptPbkdf from 'scrypt-pbkdf';

import * as base64 from '@juanelas/base64';

//SUBTLE CRYPTO CONFIGURATION
//TODO save in ENV variables
const format = "raw";
const hashAlgUsed = "AES-GCM";
const subtleCrypto = window.crypto.subtle;
let cryptoKeyGlobal: string;

interface EncryptedData {
    base64IV: string;
    base64Data: string;
}

/**
 * Generate key using KDF with scrypt
 * @param {string} password introduced password by user
 * @param {boolean} base64Format if true, the key will be returned in base64 format
 * @returns {ArrayBuffer} generated key
 */
//TODO pass keyLength as parameter
export const generateKey = async (password: string, base64Format:boolean): Promise<string | ArrayBuffer> => {

    const salt: ArrayBuffer = await generateFixedSalt(password);
    const derivedKeyLength = 32; // in bytes
    const key = await scryptPbkdf.scrypt(password, salt, derivedKeyLength); // key is an ArrayBuffer

    if(base64Format){
        return convertBufferToBase64(key);
    }

    return key;
};

/**
 * Generate fixed salt, it has to be the same to check the key later
 * @param {string} password password introduced by user
 * @returns 
 */
//TODO: pass algorithm as parameter
 const generateFixedSalt = async (password: string) => {
    
    const hash: ArrayBuffer = await generatePasswordHash(password, "SHA-256", false) as unknown as ArrayBuffer;
    return hash.slice(16)
}

/**
 * Generate fixed salt, it has to be the same to check the key later
 * @param {string} password password introduced by user
 * @param {string} algorithm used to generate the hash
 * @param {boolean} base64Format indicates if the output is in base64 format 
 * @returns
 */
//TODO: pass algorithm and if return value in base64 or ArrayBuffer
export const generatePasswordHash = async (password: string, algorithm: string, base64Format: boolean ): Promise<string | ArrayBuffer> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await subtleCrypto.digest(algorithm, data);
    if (base64Format) {
        return convertBufferToBase64(hash);
    }
    return hash;
};


/**
 * Generate CryptoKey object with SubtleCrypto
 * @param {string} keyData Key passed as string encoded with base64
 * @returns {string} CryptoKey object stringified
 */
//TODO: pass keyusage as param
//TODO: pass algorithm as param
//TODO: pass extractable as param
export const generateCryptoKey = async (keyData: string) => {
    let keyDataDecoded: string | Uint8Array = convertBase64ToBuffer(keyData);
    let cryptoKey: CryptoKey;
    let actions: KeyUsage[] = ["encrypt", "decrypt"];
    if (typeof keyDataDecoded === "string") {
        keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
    }
    try {
        cryptoKey = await subtleCrypto.importKey(
            format,
            keyDataDecoded,
            {
                name: hashAlgUsed,
            },
            true,
            actions
        );
        const exportedKey = await subtleCrypto.exportKey("jwk", cryptoKey);
        cryptoKeyGlobal = JSON.stringify(exportedKey);
        //console.log(cryptoKeyGlobal)
    } catch (error) {
        console.error("Error generating CryptoKey: " + error);
    }

    return cryptoKeyGlobal;
};

/**
 * Encrypt data passing cryptoKey and data
 * @param {string} cryptoKeyJwk
 * @returns {JSON} Returns IV and data encrypted
 */
//TODO: pass algorithm as param
//TODO: pass cryptoKey as string or ArrayBuffer
export const encryptData = async (cryptoKeyJwk: string, data: ArrayBuffer) => {
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk, hashAlgUsed);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    let ciphertext: ArrayBuffer;

    try {
        ciphertext = await subtleCrypto.encrypt(
            {
                name: hashAlgUsed,
                iv,
            },
            cryptoKey,
            data
        );
        
        //TODO Check to return data as ArrayBuffer 
        //TODO epochtime
        const base64IV = convertBufferToBase64(iv);
        const base64Data = convertBufferToBase64(ciphertext);
        const encryptedObject = {
            base64IV,
            base64Data,
        };
        return formatEncryptedData(encryptedObject);
    } catch (error) {
        console.error("Error encrypting data: " + error);
    }

};

/**
 * Pass JsonWebKey to CryptoKey and decrypt data
 * @param {string} userCryptoKey JsonWebKey stringified
 * @param {ArrayBuffer} encryptedData Encrypted binary data
 * @param {string} dataIV used to encrypt data
 */
//TODO: pass algorithm as param
export const decryptData = async (userCryptoKey: string, encryptedData: ArrayBuffer, dataIV: string) => {

    const cryptoKey = await convertJwkToCryptoKey(userCryptoKey, hashAlgUsed);
    const iv = convertBase64ToBuffer(dataIV) as Uint8Array;

    if (iv instanceof Uint8Array && encryptedData instanceof Uint8Array) {
        try {
            return await subtleCrypto.decrypt(
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
};

export const convertBufferToBase64 = (data: ArrayBuffer) => {
    return base64.encode(data, true, false);
};

export const convertBase64ToBuffer = (data: string) => {
    return base64.decode(data);
};

/**
 * Import CryptoKey in jwk format
 * format, keyData, algorithm, extractable, keyUsages
 * @param {string} jwk JSON Web Key
 * @param {string} algorithm
 */
const convertJwkToCryptoKey = async (jwk: string, algorithm: string) => {
    const jwkParsed: JsonWebKey = JSON.parse(jwk);
    let keyDataDecoded = convertBase64ToBuffer(jwkParsed.k!);
    if (typeof keyDataDecoded === "string") {
        keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
    }
    return subtleCrypto.importKey(
        "raw",
        keyDataDecoded,
        {
            name: algorithm,
        },
        jwkParsed.ext!,
        jwkParsed.key_ops as KeyUsage[]
    );
};

export const formatEncryptedData = (encryptedObject: EncryptedData) => {
    const data = [];
    data.push({
        iv: encryptedObject.base64IV,
        encryptedData: encryptedObject.base64Data,
    });
    return JSON.stringify(data);
};
