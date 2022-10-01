import { ApiClient } from './api/apiClient';
import { CryptoUtil } from './modules/cryptoUtils';
export class SecureVaultClient {
    constructor(options) {
        this._options = options;
        this._initialized = false;
        this._cryptoUtil = new CryptoUtil(options.cryptoOptions);
        this._apiClient = new ApiClient(options.apiOptions.baseUrl, options.apiOptions.timeout);
        this._username = "";
    }
    async initialize(user) {
        const response = await this.login(user);
        if (response.status === 200) {
            this._username = user.username;
            const encKey = await this._cryptoUtil.generateKey(this._options.keyPrefixes.encKey + user.password, true);
            const cryptoKey = await this._cryptoUtil.generateCryptoKey(encKey);
            if (cryptoKey.length === 0)
                throw new Error("Error during login process");
            this._cryptoUtil.encCryptoKey = cryptoKey;
        }
        //TODO check if there is storage in vault and retrieve it
        this._initialized = true;
        return response;
    }
    async signUp(user) {
        const authKey = await this._cryptoUtil.generateKey(this._options.keyPrefixes.authKey + user.password, true);
        let newUser = { ...user };
        newUser.password = authKey;
        this._apiClient.signUp(newUser);
    }
    /**
     * Logins secure vault client
     * @param user
     * @returns login status
     */
    async login(user) {
        //TODO add try catch
        const newUser = { ...user };
        const authKey = await this._cryptoUtil.generateKey(this._options.keyPrefixes.authKey + newUser.password, true);
        newUser.password = authKey;
        const response = await this._apiClient.login(newUser);
        return response;
    }
    async logout() {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        this._apiClient.logout();
        this._cryptoUtil.encCryptoKey = "";
        this._username = "";
        this._initialized = false;
        // logout from vault
        // clear _auth_token
    }
    async getStorage() {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("test");
        //TODO define type of encrypted storage
        // get storage from vault
        // decrypt storage with enc key
        // return storage
    }
    async setStorage(storage) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("setStorage");
        // encrypt storage with enc key
        // save storage to vault
        //TODO add check if storage is file
        if (storage instanceof File) {
            const fileBinaryData = await storage?.arrayBuffer();
            const encryptedDataFileStringify = await this._cryptoUtil.encryptData(fileBinaryData);
            const encryptedDataFileJSON = JSON.parse(encryptedDataFileStringify);
            const encryptedDataBuffer = this._cryptoUtil.convertBase64ToBuffer(encryptedDataFileJSON[0]?.encryptedData);
            const encryptedFile = new File([encryptedDataBuffer], storage?.name, { type: storage?.type });
            const formData = new FormData();
            formData.append("myFile", encryptedFile);
            // END ENCRYPT FILE BLOCK
            // formData.append("myFile", file as File);
            this.checkAppendedFormData(formData);
            const { data } = await this._apiClient.uploadData(formData, this._username, encryptedDataFileJSON[0]?.iv);
            return { data };
        }
    }
    async downloadStorageToDisk(downloadUrl) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        const saltDataResponse = await this._apiClient.getDataSalt(this._username);
        const saltData = saltDataResponse.data.salt;
        const cryptoUtil = this._cryptoUtil;
        const res = await fetch(downloadUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        })
            .then((response) => response.body)
            .then((rb) => {
            if (rb === null)
                throw new Error("Response body is null");
            const reader = rb.getReader();
            return new ReadableStream({
                start(controller) {
                    // The following function handles each data chunk
                    const push = () => {
                        // "done" is a Boolean and value a "Uint8Array"
                        reader.read().then(async ({ done, value }) => {
                            // If there is no more data to read
                            if (done) {
                                console.log("done", done);
                                controller.close();
                                // saveBlob(doc, `fileName`);
                                return;
                            }
                            const decryptedData = await cryptoUtil.decryptData(value, saltData);
                            // Get the data and send it to the browser via the controller
                            controller.enqueue(decryptedData);
                            // Check chunks by logging to the console
                            console.log(done, value);
                            push();
                        });
                    };
                    push();
                },
            });
        })
            .then((stream) => 
        // Respond with our stream
        stream
            .getReader()
            .read()
            .then(({ value }) => {
            const blob = new Blob([value], { type: "image/png" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "download.png";
            document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
            a.click();
            a.remove(); //afterwards we remove the element again
        }))
            .then((result) => {
            // Do things with result
            console.log(result);
        })
            .catch((e) => console.error(e.message));
        console.log(res);
    }
    checkAppendedFormData(formData) {
        try {
            for (let element of formData.entries()) {
                console.log(element[0] + ", " + element[1]);
            }
        }
        catch (error) {
            console.log(error);
            throw new Error("Error during appending file to form data");
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSTVDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVFuRCxNQUFNLE9BQU8saUJBQWlCO0lBTzFCLFlBQVksT0FBZ0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFNBQVMsQ0FDM0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQzFCLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUM3QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBZ0I7UUFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFhLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUNoRCxJQUFJLENBQ1AsQ0FBQztZQUNGLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FDdEQsTUFBZ0IsQ0FDbkIs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RyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxRQUFrQjtRQUM1QyxJQUFJO1lBQ0EsS0FBSyxJQUFJLE9BQU8sSUFBSSxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMvQztTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUMvRDtJQUNMLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XG5cbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gJy4vYXBpL2FwaUNsaWVudCc7XG5pbXBvcnQge1xuICAgIElBcGlPcHRpb25zLCBJQ3J5cHRvT3B0aW9ucywgSUtleVByZWZpeGVzLCBJTG9naW5Vc2VyLCBVc2VyLCBWYXVsdEtleVxufSBmcm9tICcuL2ludGVyZmFjZXMvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBDcnlwdG9VdGlsIH0gZnJvbSAnLi9tb2R1bGVzL2NyeXB0b1V0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgICBhcGlPcHRpb25zOiBJQXBpT3B0aW9ucztcbiAgICBrZXlQcmVmaXhlczogSUtleVByZWZpeGVzO1xuICAgIGNyeXB0b09wdGlvbnM6IElDcnlwdG9PcHRpb25zO1xufVxuXG5leHBvcnQgY2xhc3MgU2VjdXJlVmF1bHRDbGllbnQge1xuICAgIHByaXZhdGUgX29wdGlvbnM6IE9wdGlvbnM7XG4gICAgcHJpdmF0ZSBfaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfY3J5cHRvVXRpbDogQ3J5cHRvVXRpbDtcbiAgICBwcml2YXRlIF9hcGlDbGllbnQ6IEFwaUNsaWVudDtcbiAgICBwcml2YXRlIF91c2VybmFtZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogT3B0aW9ucykge1xuICAgICAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3J5cHRvVXRpbCA9IG5ldyBDcnlwdG9VdGlsKG9wdGlvbnMuY3J5cHRvT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2FwaUNsaWVudCA9IG5ldyBBcGlDbGllbnQoXG4gICAgICAgICAgICBvcHRpb25zLmFwaU9wdGlvbnMuYmFzZVVybCxcbiAgICAgICAgICAgIG9wdGlvbnMuYXBpT3B0aW9ucy50aW1lb3V0XG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuX3VzZXJuYW1lID0gXCJcIjtcbiAgICB9XG5cbiAgICBhc3luYyBpbml0aWFsaXplKHVzZXI6IElMb2dpblVzZXIpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmxvZ2luKHVzZXIpO1xuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lID0gdXNlci51c2VybmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGVuY0tleTogVmF1bHRLZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmdlbmVyYXRlS2V5KFxuICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbnMua2V5UHJlZml4ZXMuZW5jS2V5ICsgdXNlci5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICB0cnVlXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5nZW5lcmF0ZUNyeXB0b0tleShcbiAgICAgICAgICAgICAgICBlbmNLZXkgYXMgc3RyaW5nXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGNyeXB0b0tleS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgZHVyaW5nIGxvZ2luIHByb2Nlc3NcIik7XG4gICAgICAgICAgICB0aGlzLl9jcnlwdG9VdGlsLmVuY0NyeXB0b0tleSA9IGNyeXB0b0tleTtcbiAgICAgICAgfVxuICAgICAgICAvL1RPRE8gY2hlY2sgaWYgdGhlcmUgaXMgc3RvcmFnZSBpbiB2YXVsdCBhbmQgcmV0cmlldmUgaXRcbiAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgc2lnblVwKHVzZXI6IFVzZXIpIHtcbiAgICAgICAgY29uc3QgYXV0aEtleSA9IGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zLmtleVByZWZpeGVzLmF1dGhLZXkgKyB1c2VyLnBhc3N3b3JkLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBsZXQgbmV3VXNlciA9IHsgLi4udXNlciB9O1xuICAgICAgICBuZXdVc2VyLnBhc3N3b3JkID0gYXV0aEtleSBhcyBzdHJpbmc7XG5cbiAgICAgICAgdGhpcy5fYXBpQ2xpZW50LnNpZ25VcChuZXdVc2VyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dpbnMgc2VjdXJlIHZhdWx0IGNsaWVudFxuICAgICAqIEBwYXJhbSB1c2VyXG4gICAgICogQHJldHVybnMgbG9naW4gc3RhdHVzXG4gICAgICovXG4gICAgYXN5bmMgbG9naW4odXNlcjogSUxvZ2luVXNlcik6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICAgICAgICAvL1RPRE8gYWRkIHRyeSBjYXRjaFxuICAgICAgICBjb25zdCBuZXdVc2VyID0geyAuLi51c2VyIH07XG4gICAgICAgIGNvbnN0IGF1dGhLZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmdlbmVyYXRlS2V5KFxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5rZXlQcmVmaXhlcy5hdXRoS2V5ICsgbmV3VXNlci5wYXNzd29yZCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgbmV3VXNlci5wYXNzd29yZCA9IGF1dGhLZXkgYXMgc3RyaW5nO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5sb2dpbihuZXdVc2VyKTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgbG9nb3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwaUNsaWVudC5sb2dvdXQoKTtcbiAgICAgICAgdGhpcy5fY3J5cHRvVXRpbC5lbmNDcnlwdG9LZXkgPSBcIlwiO1xuICAgICAgICB0aGlzLl91c2VybmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gbG9nb3V0IGZyb20gdmF1bHRcbiAgICAgICAgLy8gY2xlYXIgX2F1dGhfdG9rZW5cbiAgICB9XG5cbiAgICBhc3luYyBnZXRTdG9yYWdlKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGVzdFwiKTtcbiAgICAgICAgLy9UT0RPIGRlZmluZSB0eXBlIG9mIGVuY3J5cHRlZCBzdG9yYWdlXG4gICAgICAgIC8vIGdldCBzdG9yYWdlIGZyb20gdmF1bHRcbiAgICAgICAgLy8gZGVjcnlwdCBzdG9yYWdlIHdpdGggZW5jIGtleVxuICAgICAgICAvLyByZXR1cm4gc3RvcmFnZVxuICAgIH1cblxuICAgIGFzeW5jIHNldFN0b3JhZ2Uoc3RvcmFnZTogYW55IHwgRmlsZSk6IFByb21pc2U8QXhpb3NSZXNwb25zZVtcImRhdGFcIl0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcInNldFN0b3JhZ2VcIik7XG4gICAgICAgIC8vIGVuY3J5cHQgc3RvcmFnZSB3aXRoIGVuYyBrZXlcbiAgICAgICAgLy8gc2F2ZSBzdG9yYWdlIHRvIHZhdWx0XG4gICAgICAgIC8vVE9ETyBhZGQgY2hlY2sgaWYgc3RvcmFnZSBpcyBmaWxlXG4gICAgICAgIGlmIChzdG9yYWdlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgY29uc3QgZmlsZUJpbmFyeURhdGEgPSBhd2FpdCBzdG9yYWdlPy5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgY29uc3QgZW5jcnlwdGVkRGF0YUZpbGVTdHJpbmdpZnkgPVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZW5jcnlwdERhdGEoXG4gICAgICAgICAgICAgICAgICAgIGZpbGVCaW5hcnlEYXRhIGFzIEFycmF5QnVmZmVyXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgZW5jcnlwdGVkRGF0YUZpbGVKU09OID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBlbmNyeXB0ZWREYXRhRmlsZVN0cmluZ2lmeSBhcyBzdHJpbmdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBlbmNyeXB0ZWREYXRhQnVmZmVyID0gdGhpcy5fY3J5cHRvVXRpbC5jb252ZXJ0QmFzZTY0VG9CdWZmZXIoXG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkRGF0YUZpbGVKU09OWzBdPy5lbmNyeXB0ZWREYXRhXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBlbmNyeXB0ZWRGaWxlID0gbmV3IEZpbGUoXG4gICAgICAgICAgICAgICAgW2VuY3J5cHRlZERhdGFCdWZmZXJdLFxuICAgICAgICAgICAgICAgIHN0b3JhZ2U/Lm5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIHsgdHlwZTogc3RvcmFnZT8udHlwZSB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBmb3JtRGF0YTogRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwibXlGaWxlXCIsIGVuY3J5cHRlZEZpbGUgYXMgRmlsZSk7XG4gICAgICAgICAgICAvLyBFTkQgRU5DUllQVCBGSUxFIEJMT0NLXG5cbiAgICAgICAgICAgIC8vIGZvcm1EYXRhLmFwcGVuZChcIm15RmlsZVwiLCBmaWxlIGFzIEZpbGUpO1xuXG4gICAgICAgICAgICB0aGlzLmNoZWNrQXBwZW5kZWRGb3JtRGF0YShmb3JtRGF0YSk7XG4gICAgICAgICAgICBjb25zdCB7IGRhdGEgfTogQXhpb3NSZXNwb25zZVtcImRhdGFcIl0gPVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX2FwaUNsaWVudC51cGxvYWREYXRhKFxuICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGVuY3J5cHRlZERhdGFGaWxlSlNPTlswXT8uaXZcbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICByZXR1cm4geyBkYXRhIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBkb3dubG9hZFN0b3JhZ2VUb0Rpc2soZG93bmxvYWRVcmw6IHN0cmluZykge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2FsdERhdGFSZXNwb25zZSA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5nZXREYXRhU2FsdChcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHNhbHREYXRhID0gc2FsdERhdGFSZXNwb25zZS5kYXRhLnNhbHQ7XG4gICAgICAgIGNvbnN0IGNyeXB0b1V0aWwgPSB0aGlzLl9jcnlwdG9VdGlsO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChkb3dubG9hZFVybCBhcyBzdHJpbmcsIHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCI6IFwiKlwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuYm9keSlcbiAgICAgICAgICAgIC50aGVuKChyYikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyYiA9PT0gbnVsbCkgdGhyb3cgbmV3IEVycm9yKFwiUmVzcG9uc2UgYm9keSBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IHJiLmdldFJlYWRlcigpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWFkYWJsZVN0cmVhbSh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gaGFuZGxlcyBlYWNoIGRhdGEgY2h1bmtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHB1c2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJkb25lXCIgaXMgYSBCb29sZWFuIGFuZCB2YWx1ZSBhIFwiVWludDhBcnJheVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVhZGVyLnJlYWQoKS50aGVuKGFzeW5jICh7IGRvbmUsIHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIHRvIHJlYWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZG9uZVwiLCBkb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXIuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNhdmVCbG9iKGRvYywgYGZpbGVOYW1lYCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkZWNyeXB0ZWREYXRhID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGNyeXB0b1V0aWwuZGVjcnlwdERhdGEoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FsdERhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgZGF0YSBhbmQgc2VuZCBpdCB0byB0aGUgYnJvd3NlciB2aWEgdGhlIGNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGRlY3J5cHRlZERhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBjaHVua3MgYnkgbG9nZ2luZyB0byB0aGUgY29uc29sZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkb25lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbigoc3RyZWFtKSA9PlxuICAgICAgICAgICAgICAgIC8vIFJlc3BvbmQgd2l0aCBvdXIgc3RyZWFtXG4gICAgICAgICAgICAgICAgc3RyZWFtXG4gICAgICAgICAgICAgICAgICAgIC5nZXRSZWFkZXIoKVxuICAgICAgICAgICAgICAgICAgICAucmVhZCgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbdmFsdWVdLCB7IHR5cGU6IFwiaW1hZ2UvcG5nXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5kb3dubG9hZCA9IFwiZG93bmxvYWQucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGEpOyAvLyB3ZSBuZWVkIHRvIGFwcGVuZCB0aGUgZWxlbWVudCB0byB0aGUgZG9tIC0+IG90aGVyd2lzZSBpdCB3aWxsIG5vdCB3b3JrIGluIGZpcmVmb3hcbiAgICAgICAgICAgICAgICAgICAgICAgIGEuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEucmVtb3ZlKCk7IC8vYWZ0ZXJ3YXJkcyB3ZSByZW1vdmUgdGhlIGVsZW1lbnQgYWdhaW5cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBEbyB0aGluZ3Mgd2l0aCByZXN1bHRcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4gY29uc29sZS5lcnJvcihlLm1lc3NhZ2UpKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tBcHBlbmRlZEZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBmb3JtRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50WzBdICsgXCIsIFwiICsgZWxlbWVudFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgYXBwZW5kaW5nIGZpbGUgdG8gZm9ybSBkYXRhXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19