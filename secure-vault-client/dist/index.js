import { ApiClient } from "./api/apiClient";
import { CryptoUtil } from "./modules/cryptoUtils";
import { EventSourcePolyfill } from "event-source-polyfill";
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
        const status = await this._apiClient.signUp(newUser);
        return status;
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
        const response = await this._apiClient.getData(this._username);
        let storageContainer = {
            epochtime: 0,
            data: "",
        };
        if (response.status === 500)
            return response;
        const data = await this._cryptoUtil.downloadDataFromUrl(response.data.url, response.data.salt_data);
        storageContainer.epochtime = response.data.epochtime;
        //TEST
        const test = new File([data], "test.json", {
            type: "application/json",
        });
        const val = await test.text();
        storageContainer.data = val;
        console.log(val);
        //TEST
        response.data["storage"] = storageContainer;
        //download storage from google storage
        //save encrypted file to local storage
        //decrypt the file and show it on the frontend
        //TODO define type of encrypted storage
        return response;
    }
    //TODO add response type
    async setStorage(storage) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("setStorage");
        const uploadTime = new Date().getTime();
        const isLastUploadResponse = await this._apiClient.checkIsLastUpload(this._username, uploadTime);
        if (!isLastUploadResponse.data.isLastUpload) {
            isLastUploadResponse.status = 500;
            return isLastUploadResponse;
        }
        console.log(isLastUploadResponse.data.message);
        const fileBinaryData = await storage?.arrayBuffer();
        const encryptedDataFileStringify = await this._cryptoUtil.encryptData(fileBinaryData);
        const encryptedDataFileJSON = JSON.parse(encryptedDataFileStringify);
        const encryptedDataBuffer = this._cryptoUtil.convertBase64ToBuffer(encryptedDataFileJSON[0]?.encryptedData);
        const encryptedFile = new File([encryptedDataBuffer], storage?.name, { type: storage?.type });
        const formData = new FormData();
        formData.append("myFile", encryptedFile);
        this.checkAppendedFormData(formData);
        const response = await this._apiClient.uploadData(formData, this._username, encryptedDataFileJSON[0]?.iv, uploadTime);
        if (response.status === 201) {
            localStorage.setItem("vault_data_epochtime", uploadTime.toString());
            let fileContent = await storage.text();
            response.data["storage"] = fileContent;
            console.log(fileContent);
            //TODO add storage to json object
            //TODO add to response the storage
        }
        return response;
    }
    async downloadStorageToDisk() {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        const saltDataResponse = await this._apiClient.getDataSalt(this._username);
        const saltData = saltDataResponse.data.salt;
        // this._cryptoUtil.downloadDataFromUrl(downloadUrl, saltData);
        this._cryptoUtil.downloadDataFromLocalStorage(saltData);
    }
    async subscribeStorage() {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        const headers = await this._apiClient.getAuthorizationHeadersStorage(this._username);
        const eventSource = new EventSourcePolyfill(this._options.apiOptions.baseUrl + "/files/storageSubscription", headers);
        return eventSource;
    }
    async unsubscribeStorage(eventSource) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        eventSource.close();
    }
    async getReadableStorage(response) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        let storageContainer = {
            epochtime: 0,
            data: "",
        };
        response.data = JSON.parse(response.data);
        const data = await this._cryptoUtil.downloadDataFromUrl(response.data.url, response.data.salt_data);
        storageContainer.epochtime = response.data.epochtime;
        //TEST
        const file = new File([data], "file.json", {
            type: "application/json",
        });
        const val = await file.text();
        storageContainer.data = val;
        return storageContainer;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBUzVDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVk1RCxNQUFNLE9BQU8saUJBQWlCO0lBTzFCLFlBQVksT0FBZ0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFNBQVMsQ0FDM0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQzFCLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUM3QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBZ0I7UUFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFhLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUNoRCxJQUFJLENBQ1AsQ0FBQztZQUNGLE1BQU0sU0FBUyxHQUFHLE1BQU0s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Q0FBQztZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7U0FDL0Q7SUFDTCxDQUFDO0NBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSBcImF4aW9zXCI7XG5cbmltcG9ydCB7IEFwaUNsaWVudCB9IGZyb20gXCIuL2FwaS9hcGlDbGllbnRcIjtcbmltcG9ydCB7XG4gICAgSUFwaU9wdGlvbnMsXG4gICAgSUNyeXB0b09wdGlvbnMsXG4gICAgSUtleVByZWZpeGVzLFxuICAgIElMb2dpblVzZXIsXG4gICAgVXNlcixcbiAgICBWYXVsdEtleSxcbn0gZnJvbSBcIi4vaW50ZXJmYWNlcy9pbnRlcmZhY2VzXCI7XG5pbXBvcnQgeyBDcnlwdG9VdGlsIH0gZnJvbSBcIi4vbW9kdWxlcy9jcnlwdG9VdGlsc1wiO1xuaW1wb3J0IGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0IHsgRXZlbnRTb3VyY2VQb2x5ZmlsbCB9IGZyb20gXCJldmVudC1zb3VyY2UtcG9seWZpbGxcIjtcblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgICBhcGlPcHRpb25zOiBJQXBpT3B0aW9ucztcbiAgICBrZXlQcmVmaXhlczogSUtleVByZWZpeGVzO1xuICAgIGNyeXB0b09wdGlvbnM6IElDcnlwdG9PcHRpb25zO1xufVxuZXhwb3J0IGludGVyZmFjZSBTdG9yYWdlQ29udGFpbmVyIHtcbiAgICBlcG9jaHRpbWU6IG51bWJlcjtcbiAgICBkYXRhOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTZWN1cmVWYXVsdENsaWVudCB7XG4gICAgcHJpdmF0ZSBfb3B0aW9uczogT3B0aW9ucztcbiAgICBwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcnlwdG9VdGlsOiBDcnlwdG9VdGlsO1xuICAgIHByaXZhdGUgX2FwaUNsaWVudDogQXBpQ2xpZW50O1xuICAgIHByaXZhdGUgX3VzZXJuYW1lOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiBPcHRpb25zKSB7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jcnlwdG9VdGlsID0gbmV3IENyeXB0b1V0aWwob3B0aW9ucy5jcnlwdG9PcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYXBpQ2xpZW50ID0gbmV3IEFwaUNsaWVudChcbiAgICAgICAgICAgIG9wdGlvbnMuYXBpT3B0aW9ucy5iYXNlVXJsLFxuICAgICAgICAgICAgb3B0aW9ucy5hcGlPcHRpb25zLnRpbWVvdXRcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5fdXNlcm5hbWUgPSBcIlwiO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXRpYWxpemUodXNlcjogSUxvZ2luVXNlcik6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMubG9naW4odXNlcik7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgdGhpcy5fdXNlcm5hbWUgPSB1c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICAgY29uc3QgZW5jS2V5OiBWYXVsdEtleSA9IGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5rZXlQcmVmaXhlcy5lbmNLZXkgKyB1c2VyLnBhc3N3b3JkLFxuICAgICAgICAgICAgICAgIHRydWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBjcnlwdG9LZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmdlbmVyYXRlQ3J5cHRvS2V5KFxuICAgICAgICAgICAgICAgIGVuY0tleSBhcyBzdHJpbmdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoY3J5cHRvS2V5Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgbG9naW4gcHJvY2Vzc1wiKTtcbiAgICAgICAgICAgIHRoaXMuX2NyeXB0b1V0aWwuZW5jQ3J5cHRvS2V5ID0gY3J5cHRvS2V5O1xuICAgICAgICB9XG4gICAgICAgIC8vVE9ETyBjaGVjayBpZiB0aGVyZSBpcyBzdG9yYWdlIGluIHZhdWx0IGFuZCByZXRyaWV2ZSBpdFxuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbiAgICBhc3luYyBzaWduVXAodXNlcjogVXNlcik6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IGF1dGhLZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmdlbmVyYXRlS2V5KFxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5rZXlQcmVmaXhlcy5hdXRoS2V5ICsgdXNlci5wYXNzd29yZCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgbGV0IG5ld1VzZXIgPSB7IC4uLnVzZXIgfTtcbiAgICAgICAgbmV3VXNlci5wYXNzd29yZCA9IGF1dGhLZXkgYXMgc3RyaW5nO1xuXG4gICAgICAgIGNvbnN0IHN0YXR1cyA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5zaWduVXAobmV3VXNlcik7XG4gICAgICAgIHJldHVybiBzdGF0dXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9naW5zIHNlY3VyZSB2YXVsdCBjbGllbnRcbiAgICAgKiBAcGFyYW0gdXNlclxuICAgICAqIEByZXR1cm5zIGxvZ2luIHN0YXR1c1xuICAgICAqL1xuICAgIGFzeW5jIGxvZ2luKHVzZXI6IElMb2dpblVzZXIpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U+IHtcbiAgICAgICAgLy9UT0RPIGFkZCB0cnkgY2F0Y2hcbiAgICAgICAgY29uc3QgbmV3VXNlciA9IHsgLi4udXNlciB9O1xuICAgICAgICBjb25zdCBhdXRoS2V5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5nZW5lcmF0ZUtleShcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMua2V5UHJlZml4ZXMuYXV0aEtleSArIG5ld1VzZXIucGFzc3dvcmQsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIG5ld1VzZXIucGFzc3dvcmQgPSBhdXRoS2V5IGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9hcGlDbGllbnQubG9naW4obmV3VXNlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIGFzeW5jIGxvZ291dCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hcGlDbGllbnQubG9nb3V0KCk7XG4gICAgICAgIHRoaXMuX2NyeXB0b1V0aWwuZW5jQ3J5cHRvS2V5ID0gXCJcIjtcbiAgICAgICAgdGhpcy5fdXNlcm5hbWUgPSBcIlwiO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGxvZ291dCBmcm9tIHZhdWx0XG4gICAgICAgIC8vIGNsZWFyIF9hdXRoX3Rva2VuXG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0U3RvcmFnZSgpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5fYXBpQ2xpZW50LmdldERhdGEoXG4gICAgICAgICAgICB0aGlzLl91c2VybmFtZVxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBzdG9yYWdlQ29udGFpbmVyID0ge1xuICAgICAgICAgICAgZXBvY2h0aW1lOiAwLFxuICAgICAgICAgICAgZGF0YTogXCJcIixcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA1MDApIHJldHVybiByZXNwb25zZTtcblxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5kb3dubG9hZERhdGFGcm9tVXJsKFxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS51cmwsXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLnNhbHRfZGF0YVxuICAgICAgICApO1xuICAgICAgICBzdG9yYWdlQ29udGFpbmVyLmVwb2NodGltZSA9IHJlc3BvbnNlLmRhdGEuZXBvY2h0aW1lO1xuICAgICAgICAvL1RFU1RcbiAgICAgICAgY29uc3QgdGVzdCA9IG5ldyBGaWxlKFtkYXRhXSwgXCJ0ZXN0Lmpzb25cIiwge1xuICAgICAgICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB2YWwgPSBhd2FpdCB0ZXN0LnRleHQoKTtcbiAgICAgICAgc3RvcmFnZUNvbnRhaW5lci5kYXRhID0gdmFsO1xuICAgICAgICBjb25zb2xlLmxvZyh2YWwpO1xuXG4gICAgICAgIC8vVEVTVFxuICAgICAgICByZXNwb25zZS5kYXRhW1wic3RvcmFnZVwiXSA9IHN0b3JhZ2VDb250YWluZXI7XG4gICAgICAgIC8vZG93bmxvYWQgc3RvcmFnZSBmcm9tIGdvb2dsZSBzdG9yYWdlXG4gICAgICAgIC8vc2F2ZSBlbmNyeXB0ZWQgZmlsZSB0byBsb2NhbCBzdG9yYWdlXG4gICAgICAgIC8vZGVjcnlwdCB0aGUgZmlsZSBhbmQgc2hvdyBpdCBvbiB0aGUgZnJvbnRlbmRcbiAgICAgICAgLy9UT0RPIGRlZmluZSB0eXBlIG9mIGVuY3J5cHRlZCBzdG9yYWdlXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbiAgICAvL1RPRE8gYWRkIHJlc3BvbnNlIHR5cGVcbiAgICBhc3luYyBzZXRTdG9yYWdlKHN0b3JhZ2U6IEZpbGUpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcInNldFN0b3JhZ2VcIik7XG5cbiAgICAgICAgY29uc3QgdXBsb2FkVGltZTogRXBvY2hUaW1lU3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgY29uc3QgaXNMYXN0VXBsb2FkUmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPVxuICAgICAgICAgICAgYXdhaXQgdGhpcy5fYXBpQ2xpZW50LmNoZWNrSXNMYXN0VXBsb2FkKHRoaXMuX3VzZXJuYW1lLCB1cGxvYWRUaW1lKTtcblxuICAgICAgICBpZiAoIWlzTGFzdFVwbG9hZFJlc3BvbnNlLmRhdGEuaXNMYXN0VXBsb2FkKSB7XG4gICAgICAgICAgICBpc0xhc3RVcGxvYWRSZXNwb25zZS5zdGF0dXMgPSA1MDA7XG4gICAgICAgICAgICByZXR1cm4gaXNMYXN0VXBsb2FkUmVzcG9uc2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coaXNMYXN0VXBsb2FkUmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblxuICAgICAgICBjb25zdCBmaWxlQmluYXJ5RGF0YSA9IGF3YWl0IHN0b3JhZ2U/LmFycmF5QnVmZmVyKCk7XG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZERhdGFGaWxlU3RyaW5naWZ5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5lbmNyeXB0RGF0YShcbiAgICAgICAgICAgIGZpbGVCaW5hcnlEYXRhIGFzIEFycmF5QnVmZmVyXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZW5jcnlwdGVkRGF0YUZpbGVKU09OID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgIGVuY3J5cHRlZERhdGFGaWxlU3RyaW5naWZ5IGFzIHN0cmluZ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCBlbmNyeXB0ZWREYXRhQnVmZmVyID0gdGhpcy5fY3J5cHRvVXRpbC5jb252ZXJ0QmFzZTY0VG9CdWZmZXIoXG4gICAgICAgICAgICBlbmNyeXB0ZWREYXRhRmlsZUpTT05bMF0/LmVuY3J5cHRlZERhdGFcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBlbmNyeXB0ZWRGaWxlID0gbmV3IEZpbGUoXG4gICAgICAgICAgICBbZW5jcnlwdGVkRGF0YUJ1ZmZlcl0sXG4gICAgICAgICAgICBzdG9yYWdlPy5uYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgIHsgdHlwZTogc3RvcmFnZT8udHlwZSB9XG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgZm9ybURhdGE6IEZvcm1EYXRhID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwibXlGaWxlXCIsIGVuY3J5cHRlZEZpbGUgYXMgRmlsZSk7XG5cbiAgICAgICAgdGhpcy5jaGVja0FwcGVuZGVkRm9ybURhdGEoZm9ybURhdGEpO1xuICAgICAgICBjb25zdCByZXNwb25zZTogQXhpb3NSZXNwb25zZSA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC51cGxvYWREYXRhKFxuICAgICAgICAgICAgZm9ybURhdGEsXG4gICAgICAgICAgICB0aGlzLl91c2VybmFtZSxcbiAgICAgICAgICAgIGVuY3J5cHRlZERhdGFGaWxlSlNPTlswXT8uaXYsXG4gICAgICAgICAgICB1cGxvYWRUaW1lXG4gICAgICAgICk7XG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ2YXVsdF9kYXRhX2Vwb2NodGltZVwiLCB1cGxvYWRUaW1lLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgbGV0IGZpbGVDb250ZW50ID0gYXdhaXQgc3RvcmFnZS50ZXh0KCk7XG4gICAgICAgICAgICByZXNwb25zZS5kYXRhW1wic3RvcmFnZVwiXSA9IGZpbGVDb250ZW50O1xuICAgICAgICAgICAgY29uc29sZS5sb2coZmlsZUNvbnRlbnQpO1xuICAgICAgICAgICAgLy9UT0RPIGFkZCBzdG9yYWdlIHRvIGpzb24gb2JqZWN0XG4gICAgICAgICAgICAvL1RPRE8gYWRkIHRvIHJlc3BvbnNlIHRoZSBzdG9yYWdlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgZG93bmxvYWRTdG9yYWdlVG9EaXNrKCkge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2FsdERhdGFSZXNwb25zZSA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5nZXREYXRhU2FsdChcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHNhbHREYXRhID0gc2FsdERhdGFSZXNwb25zZS5kYXRhLnNhbHQ7XG4gICAgICAgIC8vIHRoaXMuX2NyeXB0b1V0aWwuZG93bmxvYWREYXRhRnJvbVVybChkb3dubG9hZFVybCwgc2FsdERhdGEpO1xuICAgICAgICB0aGlzLl9jcnlwdG9VdGlsLmRvd25sb2FkRGF0YUZyb21Mb2NhbFN0b3JhZ2Uoc2FsdERhdGEpO1xuICAgIH1cblxuICAgIGFzeW5jIHN1YnNjcmliZVN0b3JhZ2UoKTogUHJvbWlzZTxFdmVudFNvdXJjZVBvbHlmaWxsPiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5nZXRBdXRob3JpemF0aW9uSGVhZGVyc1N0b3JhZ2UoXG4gICAgICAgICAgICB0aGlzLl91c2VybmFtZVxuICAgICAgICApO1xuICAgICAgICBjb25zdCBldmVudFNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZVBvbHlmaWxsKHRoaXMuX29wdGlvbnMuYXBpT3B0aW9ucy5iYXNlVXJsICsgXCIvZmlsZXMvc3RvcmFnZVN1YnNjcmlwdGlvblwiLCBoZWFkZXJzKTtcblxuICAgICAgICByZXR1cm4gZXZlbnRTb3VyY2U7XG4gICAgfVxuICAgIGFzeW5jIHVuc3Vic2NyaWJlU3RvcmFnZShldmVudFNvdXJjZTogRXZlbnRTb3VyY2VQb2x5ZmlsbCkge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGV2ZW50U291cmNlLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2V0UmVhZGFibGVTdG9yYWdlKHJlc3BvbnNlOmFueSk6IFByb21pc2U8U3RvcmFnZUNvbnRhaW5lcj4ge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdG9yYWdlQ29udGFpbmVyID0ge1xuICAgICAgICAgICAgZXBvY2h0aW1lOiAwLFxuICAgICAgICAgICAgZGF0YTogXCJcIixcbiAgICAgICAgfTtcblxuICAgICAgICByZXNwb25zZS5kYXRhID0gSlNPTi5wYXJzZShyZXNwb25zZS5kYXRhKTtcblxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5kb3dubG9hZERhdGFGcm9tVXJsKFxuICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS51cmwsXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLnNhbHRfZGF0YVxuICAgICAgICApO1xuICAgICAgICBzdG9yYWdlQ29udGFpbmVyLmVwb2NodGltZSA9IHJlc3BvbnNlLmRhdGEuZXBvY2h0aW1lO1xuICAgICAgICBcbiAgICAgICAgLy9URVNUXG4gICAgICAgIGNvbnN0IGZpbGUgPSBuZXcgRmlsZShbZGF0YV0sIFwiZmlsZS5qc29uXCIsIHtcbiAgICAgICAgICAgIHR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdmFsID0gYXdhaXQgZmlsZS50ZXh0KCk7XG4gICAgICAgIHN0b3JhZ2VDb250YWluZXIuZGF0YSA9IHZhbDtcblxuICAgICAgICByZXR1cm4gc3RvcmFnZUNvbnRhaW5lcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrQXBwZW5kZWRGb3JtRGF0YShmb3JtRGF0YTogRm9ybURhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZm9ybURhdGEuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZWxlbWVudFswXSArIFwiLCBcIiArIGVsZW1lbnRbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgZHVyaW5nIGFwcGVuZGluZyBmaWxlIHRvIGZvcm0gZGF0YVwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==