import * as scryptPbkdf from 'scrypt-pbkdf'
import * as base64 from '@juanelas/base64'


//subtle crypto config
const format = 'raw'
const hashAlgUsed = 'AES-GCM'
const subtleCrypto = window.crypto.subtle;
let cryptoKeyGlobal:string;

interface EncryptedData {
    base64IV: string,
    base64Data: string
}

const prefixSubKeys = {
    authenticationKey: 'auth',
    encryptionKey: 'enc'
}

/**
 * Generate key using KDF with scrypt
 * @param {string} password introduced password by user
 */
export const generateKey = async (password: string) => {
    // const salt = scryptPbkdf.salt()  
    const fixedSalt = await generateFixedSalt(password) // returns an ArrayBuffer filled with 16 random bytes
    const derivedKeyLength = 32 // in bytes
    const key = await scryptPbkdf.scrypt(password, fixedSalt, derivedKeyLength) // key is an ArrayBuffer
    console.log(key);console.log(convertBufferToBase64(key))

    return convertBufferToBase64(key);
}

/**
 * Generate fixed salt, it has to be the same to check the key later
 * @param {string} password password introduced by user
 * @returns 
 */
const generateFixedSalt = async (password: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await subtleCrypto.digest('SHA-256', data)
    //console.log(hash)
    //console.log(hash.slice(16))
    return hash.slice(16)
}

/**
 * Generate CryptoKey object with SubtleCrypto
 * @param {string} keyData Key passed as string encoded with base64
 */
export const generateCryptoKey = async (keyData: string) => {
    let keyDataDecoded: (string | Uint8Array) = convertBase64ToBuffer(keyData)
    let cryptoKey: CryptoKey;
    let actions: KeyUsage[] = ['encrypt', 'decrypt']
    if(typeof keyDataDecoded==='string'){
        keyDataDecoded =  Buffer.from(keyDataDecoded, "utf-8");
    }
    try {
        cryptoKey = await subtleCrypto.importKey(format, keyDataDecoded, {
            name: hashAlgUsed
        }, true, actions)
        //console.log('Show CryptoKey'); console.log(cryptoKey)
        const exportedKey = await subtleCrypto.exportKey('jwk',cryptoKey) 
        cryptoKeyGlobal = JSON.stringify(exportedKey)
        //console.log(cryptoKeyGlobal)
    } catch (error) {
        console.log('Error generating CryptoKey: ' + error)
    }

    return cryptoKeyGlobal;
}

/**
 * Encrypt data passing cryptoKey and data
 * @param {string} cryptoKeyJwk 
 * @returns {JSON} Returns IV and data encrypted
 */
export const encryptData = async (cryptoKeyJwk: string,data: string) => {
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk,hashAlgUsed)
    const ec = new TextEncoder();

    const iv = crypto.getRandomValues(new Uint8Array(12));
    let ciphertext:ArrayBuffer;

    try {
        ciphertext = await subtleCrypto.encrypt({
            name: hashAlgUsed,
            iv,
        }, cryptoKey, ec.encode(data))
        // console.log('Show IV'); console.log(iv); console.log('Show encrypted data');console.log(encryptedData)
        
        const base64IV = convertBufferToBase64(iv)
        const base64Data = convertBufferToBase64(ciphertext)
        const encryptedObject = {
            base64IV,
            base64Data
        }
        // console.log('Show parsed data to base 64')
        // console.log(JSON.stringify(encryptedObject))
        const formattedObject = formatEncryptedData(encryptedObject) 
        return formattedObject
    } catch (error) {
        console.log('Error encrypting data: ' + error)
    }

    // return encryptedObject

}

/**
 * Send password and decrypt the object if it's the right one
 * @param {string} password Send password to decrypt the data 
 */
export const decryptData = async (password: string,dataJSON: string) => {

    const key = await generateKey(password)
    const cryptoKeyJwk = await generateCryptoKey(key)
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk,hashAlgUsed)

    // const dataBuffer = fs.readFileSync('encrypted.json')
    // const dataJSON = dataBuffer.toString()
    const encryptedObject = JSON.parse(dataJSON)

    const iv = convertBase64ToBuffer(encryptedObject.base64IV)
    const ciphertext = convertBase64ToBuffer(encryptedObject.base64Data)
    if(iv instanceof Uint8Array && ciphertext instanceof Uint8Array){
        try {
            const decryptedData = await subtleCrypto.decrypt({
                    name: "AES-GCM",
                    iv: iv
                },
                cryptoKey,
                ciphertext
            )
            const dec = new TextDecoder();
            const data = dec.decode(decryptedData)
            console.log('Decrypted data: ' + data)
            return data
        } catch (error) {
            debugger;
            let errorMessage = "Failed authentication.";
            if (error instanceof Error) {
                // errorMessage = error.message;
                if(error.toString()==='Error: Cipher job failed'){
                    console.log('Error: Wrong password!!!')
                }
                else{
                    console.log('Error decrypting data: ' + error)
                }
            }
            console.log(errorMessage);
        }

    }
    else{
        console.log('Error datatype during IV and Cipher processing.')
    }

}

/**
 * Check password introduced with the existing one in the database
 * @param {string} dbPassword 
 * @param {string} formPassword 
 * @returns {boolean} 
 */
export const checkPassword = async (formPassword: string, dbPassword: string): Promise<boolean> => {
    const encoder = new TextEncoder()
    const data: Uint8Array = encoder.encode(formPassword)
    const hashedPassword: ArrayBuffer = await subtleCrypto.digest('SHA-256', data)
    const hashBase64:string = convertBufferToBase64(hashedPassword)
    const hashedPasswordFromDecryptedData = await decryptData(formPassword,dbPassword)
    return (hashedPasswordFromDecryptedData === hashBase64)
}

export const convertBufferToBase64 = (data: ArrayBuffer) => { 
    return base64.encode(data, true, false)
}

const convertBase64ToBuffer = (data: string) => {
    return base64.decode(data)
}

/**
 * Import CryptoKey in jwk format
 * format, keyData, algorithm, extractable, keyUsages
 * @param {*} jwk JSON Web Key
 * @param {string} algorithm
 */
const convertJwkToCryptoKey = async (jwk: string,algorithm: string) => {
    const jwkParsed:JsonWebKey = JSON.parse(jwk!)
    let keyDataDecoded = convertBase64ToBuffer(jwkParsed.k!);
    if(typeof keyDataDecoded==='string'){
       keyDataDecoded =  Buffer.from(keyDataDecoded, "utf-8");
    }
    let importedKey = await subtleCrypto.importKey('raw', keyDataDecoded, {
        name: algorithm
    }, jwkParsed.ext!, jwkParsed.key_ops as KeyUsage[])
    
    return importedKey
}

export const formatEncryptedData = (encryptedObject: EncryptedData) => {

    const data = []
    data.push({
        iv: encryptedObject.base64IV,
        encryptedData: encryptedObject.base64Data
    })
    return JSON.stringify(encryptedObject)
}