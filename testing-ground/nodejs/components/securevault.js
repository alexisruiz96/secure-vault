const fs = require('fs')
const chalk = require('chalk')
const scryptPbkdf = require('scrypt-pbkdf')
const crypto = require('crypto').webcrypto
const users = require('./users.js')
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
    //console.log(key);console.log(convertBufferToBase64(key))
    
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
        console.log(chalk.red.inverse('Error generating CryptoKey: ' + error))
    }

    return cryptoKey;
}

/**
 * Encrypt data passing cryptoKey and data
 * TODO modify method to pass data to encrypt
 * @param {string} cryptoKeyJwk 
 * @returns {JSON} Returns IV and data encrypted
 */
const encryptData = async (cryptoKeyJwk) => {
    const cryptoKey = await convertJwkToCryptoKey(cryptoKeyJwk,hashAlgUsed)
    const ec = new TextEncoder();
    //TODO delete this data variable and use passed param
    const data = users.loadUsers()
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
        saveEncryptedData(encryptedObject)
    } catch (error) {
        console.log(chalk.red.inverse('Error encrypting data: ' + error))
    }

    return encryptedObject

}

/**
 * Send password and decrypt the object if it's the right one
 * @param {string} password Send password to decrypt the data 
 */
//TODO decrypt data based on passing right password
//TODO send as param encrypted object
const decryptData = async (password) => {

    const key = await generateKey(password)
    const cryptoKey = await generateCryptoKey(key)

    const dataBuffer = fs.readFileSync('encrypted.json')
    const dataJSON = dataBuffer.toString()
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
        console.log('Decrypted data')
        console.log(data)
    } catch (error) {
        if(error.toString()==='Error: Cipher job failed'){
            console.log(chalk.red.inverse('Error: Wrong password!!!'))
        }
        else{
            console.log(chalk.red.inverse('Error decrypting data: ' + error))
        }
    }

}

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

const saveEncryptedData = (encryptedObject) => {

    const data = []
    data.push({
        iv: encryptedObject.base64IV,
        encryptedData: encryptedObject.base64Data
    })

    fs.writeFileSync('encrypted.json', JSON.stringify(encryptedObject))
    console.log('Data stored')
}


module.exports = {
    generateKey: generateKey,
    generateCryptoKey: generateCryptoKey,
    encryptData: encryptData,
    decryptData: decryptData
}