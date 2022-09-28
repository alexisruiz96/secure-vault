const fs = require('fs')
const scryptPbkdf = require('scrypt-pbkdf')
const crypto = require('crypto').webcrypto
const base64 = require('@juanelas/base64')

const format = 'raw'
const hashAlgUsed = 'AES-GCM'

let cryptoKeyGlobal = undefined

/**
 * Generate key using KDF with scrypt
 * @param {string} password introduced password by user
 */
const generateKey = async (password) => {
    // const salt = scryptPbkdf.salt()  
    const fixedSalt = await generateFixedSalt(password) // returns an ArrayBuffer filled with 16 random bytes
    const derivedKeyLength = 32 // in bytes
    const key = await scryptPbkdf.scrypt(password, fixedSalt, derivedKeyLength) // key is an ArrayBuffer
    // console.log(key);console.log(convertBufferToBase64(key))
    
    return convertBufferToBase64(key);
}

/**
 * Generate fixed salt, it has to be the same to check the key later
 * @param {string} password password introduced by user
 * @returns 
 */
const generateFixedSalt = async (password) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    //console.log(hash)
    //console.log(hash.slice(16))
    return hash.slice(16)
}

/**
 * Generate CryptoKey object with SubtleCrypto
 * @param {string} keyData Key passed as string encoded with base64
 */
const generateCryptoKey = async (keyData) => {
    const keyDataDecoded = convertBase64ToBuffer(keyData)
    let cryptoKey = ""
    try {
        cryptoKey = await crypto.subtle.importKey(format, keyDataDecoded, {
            name: hashAlgUsed
        }, true, ['encrypt', 'decrypt'])
        //console.log('Show CryptoKey'); console.log(cryptoKey)
        const exportedKey = await crypto.subtle.exportKey('jwk',cryptoKey) 
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
const encryptData = async (cryptoKeyJwk,data) => {
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk,hashAlgUsed)
    const ec = new TextEncoder();

    const iv = crypto.getRandomValues(new Uint8Array(12));
    let ciphertext = ""

    try {
        ciphertext = await crypto.subtle.encrypt({
            name: hashAlgUsed,
            iv,
        }, cryptoKey, ec.encode(data))
        // console.log('Show IV'); console.log(iv); console.log('Show encrypted data');console.log(encryptedData)
        
        const base64IV = convertBufferToBase64(iv, true, false)
        const base64Data = convertBufferToBase64(ciphertext, true, false)
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
const decryptData = async (password,dataJSON) => {

    const key = await generateKey(password)
    const cryptoKeyJwk = await generateCryptoKey(key)
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk,hashAlgUsed)

    // const dataBuffer = fs.readFileSync('encrypted.json')
    // const dataJSON = dataBuffer.toString()
    const encryptedObject = JSON.parse(dataJSON)

    const iv = convertBase64ToBuffer(encryptedObject.base64IV)
    const ciphertext = convertBase64ToBuffer(encryptedObject.base64Data)
    try {
        const decryptedData = await crypto.subtle.decrypt({
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
        if(error.toString()==='Error: Cipher job failed'){
            console.log('Error: Wrong password!!!')
        }
        else{
            console.log('Error decrypting data: ' + error)
        }
    }

}

/**
 * Check password introduced with the existing one in the database
 * @param {string} dbPassword 
 * @param {string} formPassword 
 * @returns {boolean} 
 */
const checkPassword = async (formPassword, dbPassword) => {

    const hashedPassword = await crypto.subtle.digest('SHA-256', formPassword)
    const hashBase64 = convertBufferToBase64(hashedPassword)
    const hashedPasswordFromDecryptedData = await decryptData(formPassword,dbPassword)
    return (hashedPasswordFromDecryptedData === hashBase64)
}

//TODO pass this methods to utils.js file
const convertBufferToBase64 = (data) => { 
    return base64.encode(data, true, false)
}

const convertBase64ToBuffer = (data) => {
    return base64.decode(data)
}

/**
 * Import CryptoKey in jwk format
 * format, keyData, algorithm, extractable, keyUsages
 * @param {*} jwk JSON Web Key
 * @param {string} algorithm
 */
const convertJwkToCryptoKey = async (jwk,algorithm) => {
    const jwkParsed = JSON.parse(jwk)
    const keyDataDecoded = convertBase64ToBuffer(jwkParsed.k)
    const importedKey = await crypto.subtle.importKey('raw', keyDataDecoded, {
        name: algorithm
    }, jwkParsed.ext, jwkParsed.key_ops)

    return importedKey
}

const formatEncryptedData = (encryptedObject) => {

    const data = []
    data.push({
        iv: encryptedObject.base64IV,
        encryptedData: encryptedObject.base64Data
    })
    return JSON.stringify(encryptedObject)
}


module.exports = {
    generateKey,
    generateCryptoKey,
    encryptData,
    decryptData,
    checkPassword,
    convertBufferToBase64

}