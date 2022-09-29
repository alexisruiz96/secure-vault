import * as scryptPbkdf from "scrypt-pbkdf";
import * as base64 from "@juanelas/base64";
export class CryptoUtil {
    constructor(options) {
        this._subtleCrypto = window.crypto.subtle;
        this._options = options;
    }
    /**
     * Generate key using KDF with scrypt
     * @param {string} password introduced password by user
     * @param {boolean} base64Format if true, the key will be returned in base64 format
     * @returns {ArrayBuffer} generated key
     */
    //TODO pass keyLength as parameter
    async generateKey(password, base64Format) {
        const salt = await this.generateFixedSalt(password);
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
    async generateFixedSalt(password) {
        const hash = (await this.generatePasswordHash(password, "SHA-256", false));
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
    async generatePasswordHash(password, algorithm, base64Format) {
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
    async generateCryptoKey(keyData) {
        let keyDataDecoded = this.convertBase64ToBuffer(keyData);
        let cryptoKey;
        let actions = ["encrypt", "decrypt"];
        if (typeof keyDataDecoded === "string") {
            keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
        }
        let jsonWebKey = "";
        try {
            cryptoKey = await this._subtleCrypto.importKey(this._options.format, keyDataDecoded, {
                name: this._options.algorithm,
            }, true, actions);
            const exportedKey = await this._subtleCrypto.exportKey("jwk", cryptoKey);
            jsonWebKey = JSON.stringify(exportedKey);
            //console.log(cryptoKeyGlobal)
        }
        catch (error) {
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
    async encryptData(cryptoKeyJwk, data) {
        const cryptoKey = await this.convertJwkToCryptoKey(cryptoKeyJwk, this._options.algorithm);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        let ciphertext;
        try {
            ciphertext = await this._subtleCrypto.encrypt({
                name: this._options.algorithm,
                iv,
            }, cryptoKey, data);
            //TODO Check to return data as ArrayBuffer
            //TODO epochtime
            const base64IV = this.convertBufferToBase64(iv);
            const base64Data = this.convertBufferToBase64(ciphertext);
            const encryptedObject = {
                base64IV,
                base64Data,
            };
            return this.formatEncryptedData(encryptedObject);
        }
        catch (error) {
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
    async decryptData(userCryptoKey, encryptedData, dataIV) {
        const cryptoKey = await this.convertJwkToCryptoKey(userCryptoKey, this._options.algorithm);
        const iv = this.convertBase64ToBuffer(dataIV);
        if (iv instanceof Uint8Array && encryptedData instanceof Uint8Array) {
            try {
                return await this._subtleCrypto.decrypt({
                    name: "AES-GCM",
                    iv: iv,
                }, cryptoKey, encryptedData);
            }
            catch (error) {
                debugger;
                let errorMessage = "Failed authentication.";
                if (error instanceof Error) {
                    if (error.toString() === "Error: Cipher job failed") {
                        console.error("Error: Wrong password!!!");
                    }
                    else {
                        console.error("Error decrypting data: " + error);
                    }
                }
                console.log(errorMessage);
            }
        }
        else {
            console.error("Error datatype during IV and Cipher processing.");
        }
    }
    convertBufferToBase64(data) {
        return base64.encode(data, true, false);
    }
    convertBase64ToBuffer(data) {
        return base64.decode(data);
    }
    /**
     * Import CryptoKey in jwk format
     * format, keyData, algorithm, extractable, keyUsages
     * @param {string} jwk JSON Web Key
     * @param {string} algorithm
     */
    async convertJwkToCryptoKey(jwk, algorithm) {
        const jwkParsed = JSON.parse(jwk);
        let keyDataDecoded = this.convertBase64ToBuffer(jwkParsed.k);
        if (typeof keyDataDecoded === "string") {
            keyDataDecoded = Buffer.from(keyDataDecoded, "utf-8");
        }
        return this._subtleCrypto.importKey("raw", keyDataDecoded, {
            name: algorithm,
        }, jwkParsed.ext, jwkParsed.key_ops);
    }
    formatEncryptedData(encryptedObject) {
        const data = [];
        data.push({
            iv: encryptedObject.base64IV,
            encryptedData: encryptedObject.base64Data,
        });
        return JSON.stringify(data);
    }
    //GETTERS & SETTERS
    get encCryptoKey() {
        return this._encCryptoKey;
    }
    set encCryptoKey(value) {
        this._encCryptoKey = value;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3J5cHRvVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbW9kdWxlcy9jcnlwdG9VdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssV0FBVyxNQUFNLGNBQWMsQ0FBQztBQUM1QyxPQUFPLEtBQUssTUFBTSxNQUFNLGtCQUFrQixDQUFDO0FBUzNDLE1BQU0sT0FBTyxVQUFVO0lBS25CLFlBQVksT0FBdUI7UUFGMUIsa0JBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUcxQyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxrQ0FBa0M7SUFDbEMsS0FBSyxDQUFDLFdBQVcsQ0FDYixRQUFnQixFQUNoQixZQUFxQjtRQUVyQixNQUFNLElBQUksR0FBZ0IsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakUsTUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUMsQ0FBQyxXQUFXO1FBQ3hDLE1BQU0sR0FBRyxHQUFHLE1BQU0sV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyx3QkFBd0I7UUFFaEcsSUFBSSxZQUFZLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxtQ0FBbUM7SUFDbkMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQWdCO1FBQ3BDLE1BQU0sSUFBSSxHQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUN0RCxRQUFRLEVBQ1IsU0FBUyxFQUNULEtBQUssQ0FDUixDQUEyQixDQUFDO1FBQzdCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMs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bkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFXLFlBQVksQ0FBQyxLQUF5QjtRQUM3QyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzY3J5cHRQYmtkZiBmcm9tIFwic2NyeXB0LXBia2RmXCI7XG5pbXBvcnQgKiBhcyBiYXNlNjQgZnJvbSBcIkBqdWFuZWxhcy9iYXNlNjRcIjtcblxuaW1wb3J0IHsgSUNyeXB0b09wdGlvbnMgfSBmcm9tIFwiLi4vaW50ZXJmYWNlcy9pbnRlcmZhY2VzXCI7XG5cbmludGVyZmFjZSBFbmNyeXB0ZWREYXRhIHtcbiAgICBiYXNlNjRJVjogc3RyaW5nO1xuICAgIGJhc2U2NERhdGE6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIENyeXB0b1V0aWwge1xuICAgIHByaXZhdGUgX29wdGlvbnM6IElDcnlwdG9PcHRpb25zO1xuICAgIHByaXZhdGUgX2VuY0NyeXB0b0tleT86IHN0cmluZztcbiAgICByZWFkb25seSBfc3VidGxlQ3J5cHRvID0gd2luZG93LmNyeXB0by5zdWJ0bGU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBJQ3J5cHRvT3B0aW9ucykge1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSBrZXkgdXNpbmcgS0RGIHdpdGggc2NyeXB0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIGludHJvZHVjZWQgcGFzc3dvcmQgYnkgdXNlclxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYmFzZTY0Rm9ybWF0IGlmIHRydWUsIHRoZSBrZXkgd2lsbCBiZSByZXR1cm5lZCBpbiBiYXNlNjQgZm9ybWF0XG4gICAgICogQHJldHVybnMge0FycmF5QnVmZmVyfSBnZW5lcmF0ZWQga2V5XG4gICAgICovXG4gICAgLy9UT0RPIHBhc3Mga2V5TGVuZ3RoIGFzIHBhcmFtZXRlclxuICAgIGFzeW5jIGdlbmVyYXRlS2V5KFxuICAgICAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgICAgICBiYXNlNjRGb3JtYXQ6IGJvb2xlYW5cbiAgICApOiBQcm9taXNlPHN0cmluZyB8IEFycmF5QnVmZmVyPiB7XG4gICAgICAgIGNvbnN0IHNhbHQ6IEFycmF5QnVmZmVyID0gYXdhaXQgdGhpcy5nZW5lcmF0ZUZpeGVkU2FsdChwYXNzd29yZCk7XG4gICAgICAgIGNvbnN0IGRlcml2ZWRLZXlMZW5ndGggPSAzMjsgLy8gaW4gYnl0ZXNcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgc2NyeXB0UGJrZGYuc2NyeXB0KHBhc3N3b3JkLCBzYWx0LCBkZXJpdmVkS2V5TGVuZ3RoKTsgLy8ga2V5IGlzIGFuIEFycmF5QnVmZmVyXG5cbiAgICAgICAgaWYgKGJhc2U2NEZvcm1hdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydEJ1ZmZlclRvQmFzZTY0KGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ga2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGZpeGVkIHNhbHQsIGl0IGhhcyB0byBiZSB0aGUgc2FtZSB0byBjaGVjayB0aGUga2V5IGxhdGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIHBhc3N3b3JkIGludHJvZHVjZWQgYnkgdXNlclxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgLy9UT0RPOiBwYXNzIGFsZ29yaXRobSBhcyBwYXJhbWV0ZXJcbiAgICBhc3luYyBnZW5lcmF0ZUZpeGVkU2FsdChwYXNzd29yZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGhhc2g6IEFycmF5QnVmZmVyID0gKGF3YWl0IHRoaXMuZ2VuZXJhdGVQYXNzd29yZEhhc2goXG4gICAgICAgICAgICBwYXNzd29yZCxcbiAgICAgICAgICAgIFwiU0hBLTI1NlwiLFxuICAgICAgICAgICAgZmFsc2VcbiAgICAgICAgKSkgYXMgdW5rbm93biBhcyBBcnJheUJ1ZmZlcjtcbiAgICAgICAgcmV0dXJuIGhhc2guc2xpY2UoMTYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGZpeGVkIHNhbHQsIGl0IGhhcyB0byBiZSB0aGUgc2FtZSB0byBjaGVjayB0aGUga2V5IGxhdGVyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhc3N3b3JkIHBhc3N3b3JkIGludHJvZHVjZWQgYnkgdXNlclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGdvcml0aG0gdXNlZCB0byBnZW5lcmF0ZSB0aGUgaGFzaFxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gYmFzZTY0Rm9ybWF0IGluZGljYXRlcyBpZiB0aGUgb3V0cHV0IGlzIGluIGJhc2U2NCBmb3JtYXRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIC8vVE9ETzogcGFzcyBhbGdvcml0aG0gYW5kIGlmIHJldHVybiB2YWx1ZSBpbiBiYXNlNjQgb3IgQXJyYXlCdWZmZXJcbiAgICBhc3luYyBnZW5lcmF0ZVBhc3N3b3JkSGFzaChcbiAgICAgICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICAgICAgYWxnb3JpdGhtOiBzdHJpbmcsXG4gICAgICAgIGJhc2U2NEZvcm1hdDogYm9vbGVhblxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgQXJyYXlCdWZmZXI+IHtcbiAgICAgICAgY29uc3QgZW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgICBjb25zdCBkYXRhID0gZW5jb2Rlci5lbmNvZGUocGFzc3dvcmQpO1xuICAgICAgICBjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5fc3VidGxlQ3J5cHRvLmRpZ2VzdChhbGdvcml0aG0sIGRhdGEpO1xuICAgICAgICBpZiAoYmFzZTY0Rm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0QnVmZmVyVG9CYXNlNjQoaGFzaCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgQ3J5cHRvS2V5IG9iamVjdCB3aXRoIFN1YnRsZUNyeXB0b1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlEYXRhIEtleSBwYXNzZWQgYXMgc3RyaW5nIGVuY29kZWQgd2l0aCBiYXNlNjRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBDcnlwdG9LZXkgb2JqZWN0IHN0cmluZ2lmaWVkXG4gICAgICovXG4gICAgLy9UT0RPOiBwYXNzIGtleXVzYWdlIGFzIHBhcmFtXG4gICAgLy9UT0RPOiBwYXNzIGFsZ29yaXRobSBhcyBwYXJhbVxuICAgIC8vVE9ETzogcGFzcyBleHRyYWN0YWJsZSBhcyBwYXJhbVxuICAgIGFzeW5jIGdlbmVyYXRlQ3J5cHRvS2V5KGtleURhdGE6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgIGxldCBrZXlEYXRhRGVjb2RlZDogc3RyaW5nIHwgVWludDhBcnJheSA9XG4gICAgICAgICAgICB0aGlzLmNvbnZlcnRCYXNlNjRUb0J1ZmZlcihrZXlEYXRhKTtcbiAgICAgICAgbGV0IGNyeXB0b0tleTogQ3J5cHRvS2V5O1xuICAgICAgICBsZXQgYWN0aW9uczogS2V5VXNhZ2VbXSA9IFtcImVuY3J5cHRcIiwgXCJkZWNyeXB0XCJdO1xuICAgICAgICBpZiAodHlwZW9mIGtleURhdGFEZWNvZGVkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBrZXlEYXRhRGVjb2RlZCA9IEJ1ZmZlci5mcm9tKGtleURhdGFEZWNvZGVkLCBcInV0Zi04XCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBqc29uV2ViS2V5OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY3J5cHRvS2V5ID0gYXdhaXQgdGhpcy5fc3VidGxlQ3J5cHRvLmltcG9ydEtleShcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zLmZvcm1hdCxcbiAgICAgICAgICAgICAgICBrZXlEYXRhRGVjb2RlZCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuX29wdGlvbnMuYWxnb3JpdGhtLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgICAgICBhY3Rpb25zXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZXhwb3J0ZWRLZXk6SnNvbldlYktleSA9IGF3YWl0IHRoaXMuX3N1YnRsZUNyeXB0by5leHBvcnRLZXkoXG4gICAgICAgICAgICAgICAgXCJqd2tcIixcbiAgICAgICAgICAgICAgICBjcnlwdG9LZXlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBqc29uV2ViS2V5ID0gSlNPTi5zdHJpbmdpZnkoZXhwb3J0ZWRLZXkpO1xuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhjcnlwdG9LZXlHbG9iYWwpXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZ2VuZXJhdGluZyBDcnlwdG9LZXk6IFwiICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBqc29uV2ViS2V5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuY3J5cHQgZGF0YSBwYXNzaW5nIGNyeXB0b0tleSBhbmQgZGF0YVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBjcnlwdG9LZXlKd2tcbiAgICAgKiBAcmV0dXJucyB7SlNPTn0gUmV0dXJucyBJViBhbmQgZGF0YSBlbmNyeXB0ZWRcbiAgICAgKi9cbiAgICAvL1RPRE86IHBhc3MgYWxnb3JpdGhtIGFzIHBhcmFtXG4gICAgLy9UT0RPOiBwYXNzIGNyeXB0b0tleSBhcyBzdHJpbmcgb3IgQXJyYXlCdWZmZXJcbiAgICBhc3luYyBlbmNyeXB0RGF0YShjcnlwdG9LZXlKd2s6IHN0cmluZywgZGF0YTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgdGhpcy5jb252ZXJ0SndrVG9DcnlwdG9LZXkoXG4gICAgICAgICAgICBjcnlwdG9LZXlKd2ssXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zLmFsZ29yaXRobVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGl2ID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgxMikpO1xuICAgICAgICBsZXQgY2lwaGVydGV4dDogQXJyYXlCdWZmZXI7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNpcGhlcnRleHQgPSBhd2FpdCB0aGlzLl9zdWJ0bGVDcnlwdG8uZW5jcnlwdChcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuX29wdGlvbnMuYWxnb3JpdGhtLFxuICAgICAgICAgICAgICAgICAgICBpdixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyeXB0b0tleSxcbiAgICAgICAgICAgICAgICBkYXRhXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvL1RPRE8gQ2hlY2sgdG8gcmV0dXJuIGRhdGEgYXMgQXJyYXlCdWZmZXJcbiAgICAgICAgICAgIC8vVE9ETyBlcG9jaHRpbWVcbiAgICAgICAgICAgIGNvbnN0IGJhc2U2NElWID0gdGhpcy5jb252ZXJ0QnVmZmVyVG9CYXNlNjQoaXYpO1xuICAgICAgICAgICAgY29uc3QgYmFzZTY0RGF0YSA9IHRoaXMuY29udmVydEJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpO1xuICAgICAgICAgICAgY29uc3QgZW5jcnlwdGVkT2JqZWN0ID0ge1xuICAgICAgICAgICAgICAgIGJhc2U2NElWLFxuICAgICAgICAgICAgICAgIGJhc2U2NERhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0RW5jcnlwdGVkRGF0YShlbmNyeXB0ZWRPYmplY3QpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGVuY3J5cHRpbmcgZGF0YTogXCIgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQYXNzIEpzb25XZWJLZXkgdG8gQ3J5cHRvS2V5IGFuZCBkZWNyeXB0IGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlckNyeXB0b0tleSBKc29uV2ViS2V5IHN0cmluZ2lmaWVkXG4gICAgICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZW5jcnlwdGVkRGF0YSBFbmNyeXB0ZWQgYmluYXJ5IGRhdGFcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGF0YUlWIHVzZWQgdG8gZW5jcnlwdCBkYXRhXG4gICAgICovXG4gICAgLy9UT0RPOiBwYXNzIGFsZ29yaXRobSBhcyBwYXJhbVxuICAgIGFzeW5jIGRlY3J5cHREYXRhKFxuICAgICAgICB1c2VyQ3J5cHRvS2V5OiBzdHJpbmcsXG4gICAgICAgIGVuY3J5cHRlZERhdGE6IEFycmF5QnVmZmVyLFxuICAgICAgICBkYXRhSVY6IHN0cmluZ1xuICAgICkge1xuICAgICAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCB0aGlzLmNvbnZlcnRKd2tUb0NyeXB0b0tleShcbiAgICAgICAgICAgIHVzZXJDcnlwdG9LZXksXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zLmFsZ29yaXRobVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpdiA9IHRoaXMuY29udmVydEJhc2U2NFRvQnVmZmVyKGRhdGFJVikgYXMgVWludDhBcnJheTtcblxuICAgICAgICBpZiAoaXYgaW5zdGFuY2VvZiBVaW50OEFycmF5ICYmIGVuY3J5cHRlZERhdGEgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9zdWJ0bGVDcnlwdG8uZGVjcnlwdChcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJBRVMtR0NNXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdjogaXYsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNyeXB0b0tleSxcbiAgICAgICAgICAgICAgICAgICAgZW5jcnlwdGVkRGF0YVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICAgICAgICAgIGxldCBlcnJvck1lc3NhZ2UgPSBcIkZhaWxlZCBhdXRoZW50aWNhdGlvbi5cIjtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IudG9TdHJpbmcoKSA9PT0gXCJFcnJvcjogQ2lwaGVyIGpvYiBmYWlsZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yOiBXcm9uZyBwYXNzd29yZCEhIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBkZWNyeXB0aW5nIGRhdGE6IFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yTWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgZGF0YXR5cGUgZHVyaW5nIElWIGFuZCBDaXBoZXIgcHJvY2Vzc2luZy5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb252ZXJ0QnVmZmVyVG9CYXNlNjQoZGF0YTogQXJyYXlCdWZmZXIpIHtcbiAgICAgICAgcmV0dXJuIGJhc2U2NC5lbmNvZGUoZGF0YSwgdHJ1ZSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGNvbnZlcnRCYXNlNjRUb0J1ZmZlcihkYXRhOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIGJhc2U2NC5kZWNvZGUoZGF0YSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW1wb3J0IENyeXB0b0tleSBpbiBqd2sgZm9ybWF0XG4gICAgICogZm9ybWF0LCBrZXlEYXRhLCBhbGdvcml0aG0sIGV4dHJhY3RhYmxlLCBrZXlVc2FnZXNcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gandrIEpTT04gV2ViIEtleVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGdvcml0aG1cbiAgICAgKi9cbiAgICBhc3luYyBjb252ZXJ0SndrVG9DcnlwdG9LZXkoandrOiBzdHJpbmcsIGFsZ29yaXRobTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGp3a1BhcnNlZDogSnNvbldlYktleSA9IEpTT04ucGFyc2UoandrKTtcbiAgICAgICAgbGV0IGtleURhdGFEZWNvZGVkID0gdGhpcy5jb252ZXJ0QmFzZTY0VG9CdWZmZXIoandrUGFyc2VkLmshKTtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXlEYXRhRGVjb2RlZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAga2V5RGF0YURlY29kZWQgPSBCdWZmZXIuZnJvbShrZXlEYXRhRGVjb2RlZCwgXCJ1dGYtOFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fc3VidGxlQ3J5cHRvLmltcG9ydEtleShcbiAgICAgICAgICAgIFwicmF3XCIsXG4gICAgICAgICAgICBrZXlEYXRhRGVjb2RlZCxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBuYW1lOiBhbGdvcml0aG0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgandrUGFyc2VkLmV4dCEsXG4gICAgICAgICAgICBqd2tQYXJzZWQua2V5X29wcyBhcyBLZXlVc2FnZVtdXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm9ybWF0RW5jcnlwdGVkRGF0YShlbmNyeXB0ZWRPYmplY3Q6IEVuY3J5cHRlZERhdGEpIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IFtdO1xuICAgICAgICBkYXRhLnB1c2goe1xuICAgICAgICAgICAgaXY6IGVuY3J5cHRlZE9iamVjdC5iYXNlNjRJVixcbiAgICAgICAgICAgIGVuY3J5cHRlZERhdGE6IGVuY3J5cHRlZE9iamVjdC5iYXNlNjREYXRhLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xuICAgIH1cblxuICAgIC8vR0VUVEVSUyAmIFNFVFRFUlNcbiAgICBwdWJsaWMgZ2V0IGVuY0NyeXB0b0tleSgpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgICAgICByZXR1cm4gdGhpcy5fZW5jQ3J5cHRvS2V5O1xuICAgIH1cbiAgICBwdWJsaWMgc2V0IGVuY0NyeXB0b0tleSh2YWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuX2VuY0NyeXB0b0tleSA9IHZhbHVlO1xuICAgIH1cbn1cbiJdfQ==