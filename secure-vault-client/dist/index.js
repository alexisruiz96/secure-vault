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
    async setStorage(storage, lastEpochRegistered) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("setStorage");
        const isLastUploadResponse = await this._apiClient.checkIsLastUpload(this._username, parseInt(lastEpochRegistered));
        if (!isLastUploadResponse.data.isLastUpload) {
            isLastUploadResponse.status = 500;
            return isLastUploadResponse;
        }
        console.log(isLastUploadResponse.data.message);
        const uploadTime = new Date().getTime();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBUzVDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVk1RCxNQUFNLE9BQU8saUJBQWlCO0lBTzFCLFlBQVksT0FBZ0I7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFNBQVMsQ0FDM0IsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQzFCLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUM3QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBZ0I7UUFDN0IsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7WUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFhLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQ3ZELElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxFQUNoRCxJQUFJLENBQ1AsQ0FBQztZQUNGLE1BQU0sU0FBUyxHQUFHLE1BQU0s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QUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztTQUMvRDtJQUNMLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tIFwiYXhpb3NcIjtcblxuaW1wb3J0IHsgQXBpQ2xpZW50IH0gZnJvbSBcIi4vYXBpL2FwaUNsaWVudFwiO1xuaW1wb3J0IHtcbiAgICBJQXBpT3B0aW9ucyxcbiAgICBJQ3J5cHRvT3B0aW9ucyxcbiAgICBJS2V5UHJlZml4ZXMsXG4gICAgSUxvZ2luVXNlcixcbiAgICBVc2VyLFxuICAgIFZhdWx0S2V5LFxufSBmcm9tIFwiLi9pbnRlcmZhY2VzL2ludGVyZmFjZXNcIjtcbmltcG9ydCB7IENyeXB0b1V0aWwgfSBmcm9tIFwiLi9tb2R1bGVzL2NyeXB0b1V0aWxzXCI7XG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBFdmVudFNvdXJjZVBvbHlmaWxsIH0gZnJvbSBcImV2ZW50LXNvdXJjZS1wb2x5ZmlsbFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnMge1xuICAgIGFwaU9wdGlvbnM6IElBcGlPcHRpb25zO1xuICAgIGtleVByZWZpeGVzOiBJS2V5UHJlZml4ZXM7XG4gICAgY3J5cHRvT3B0aW9uczogSUNyeXB0b09wdGlvbnM7XG59XG5leHBvcnQgaW50ZXJmYWNlIFN0b3JhZ2VDb250YWluZXIge1xuICAgIGVwb2NodGltZTogbnVtYmVyO1xuICAgIGRhdGE6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFNlY3VyZVZhdWx0Q2xpZW50IHtcbiAgICBwcml2YXRlIF9vcHRpb25zOiBPcHRpb25zO1xuICAgIHByaXZhdGUgX2luaXRpYWxpemVkOiBib29sZWFuO1xuICAgIHByaXZhdGUgX2NyeXB0b1V0aWw6IENyeXB0b1V0aWw7XG4gICAgcHJpdmF0ZSBfYXBpQ2xpZW50OiBBcGlDbGllbnQ7XG4gICAgcHJpdmF0ZSBfdXNlcm5hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IE9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2NyeXB0b1V0aWwgPSBuZXcgQ3J5cHRvVXRpbChvcHRpb25zLmNyeXB0b09wdGlvbnMpO1xuICAgICAgICB0aGlzLl9hcGlDbGllbnQgPSBuZXcgQXBpQ2xpZW50KFxuICAgICAgICAgICAgb3B0aW9ucy5hcGlPcHRpb25zLmJhc2VVcmwsXG4gICAgICAgICAgICBvcHRpb25zLmFwaU9wdGlvbnMudGltZW91dFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl91c2VybmFtZSA9IFwiXCI7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdGlhbGl6ZSh1c2VyOiBJTG9naW5Vc2VyKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPiB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5sb2dpbih1c2VyKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICB0aGlzLl91c2VybmFtZSA9IHVzZXIudXNlcm5hbWU7XG4gICAgICAgICAgICBjb25zdCBlbmNLZXk6IFZhdWx0S2V5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5nZW5lcmF0ZUtleShcbiAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zLmtleVByZWZpeGVzLmVuY0tleSArIHVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZ2VuZXJhdGVDcnlwdG9LZXkoXG4gICAgICAgICAgICAgICAgZW5jS2V5IGFzIHN0cmluZ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjcnlwdG9LZXkubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkVycm9yIGR1cmluZyBsb2dpbiBwcm9jZXNzXCIpO1xuICAgICAgICAgICAgdGhpcy5fY3J5cHRvVXRpbC5lbmNDcnlwdG9LZXkgPSBjcnlwdG9LZXk7XG4gICAgICAgIH1cbiAgICAgICAgLy9UT0RPIGNoZWNrIGlmIHRoZXJlIGlzIHN0b3JhZ2UgaW4gdmF1bHQgYW5kIHJldHJpZXZlIGl0XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIGFzeW5jIHNpZ25VcCh1c2VyOiBVc2VyKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICAgICAgY29uc3QgYXV0aEtleSA9IGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICB0aGlzLl9vcHRpb25zLmtleVByZWZpeGVzLmF1dGhLZXkgKyB1c2VyLnBhc3N3b3JkLFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICApO1xuICAgICAgICBsZXQgbmV3VXNlciA9IHsgLi4udXNlciB9O1xuICAgICAgICBuZXdVc2VyLnBhc3N3b3JkID0gYXV0aEtleSBhcyBzdHJpbmc7XG5cbiAgICAgICAgY29uc3Qgc3RhdHVzID0gYXdhaXQgdGhpcy5fYXBpQ2xpZW50LnNpZ25VcChuZXdVc2VyKTtcbiAgICAgICAgcmV0dXJuIHN0YXR1cztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2dpbnMgc2VjdXJlIHZhdWx0IGNsaWVudFxuICAgICAqIEBwYXJhbSB1c2VyXG4gICAgICogQHJldHVybnMgbG9naW4gc3RhdHVzXG4gICAgICovXG4gICAgYXN5bmMgbG9naW4odXNlcjogSUxvZ2luVXNlcik6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICAgICAgICAvL1RPRE8gYWRkIHRyeSBjYXRjaFxuICAgICAgICBjb25zdCBuZXdVc2VyID0geyAuLi51c2VyIH07XG4gICAgICAgIGNvbnN0IGF1dGhLZXkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmdlbmVyYXRlS2V5KFxuICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5rZXlQcmVmaXhlcy5hdXRoS2V5ICsgbmV3VXNlci5wYXNzd29yZCxcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgKTtcbiAgICAgICAgbmV3VXNlci5wYXNzd29yZCA9IGF1dGhLZXkgYXMgc3RyaW5nO1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2FwaUNsaWVudC5sb2dpbihuZXdVc2VyKTtcblxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfVxuXG4gICAgYXN5bmMgbG9nb3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2FwaUNsaWVudC5sb2dvdXQoKTtcbiAgICAgICAgdGhpcy5fY3J5cHRvVXRpbC5lbmNDcnlwdG9LZXkgPSBcIlwiO1xuICAgICAgICB0aGlzLl91c2VybmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gZmFsc2U7XG5cbiAgICAgICAgLy8gbG9nb3V0IGZyb20gdmF1bHRcbiAgICAgICAgLy8gY2xlYXIgX2F1dGhfdG9rZW5cbiAgICB9XG5cbiAgICBhc3luYyBnZXRTdG9yYWdlKCk6IFByb21pc2U8QXhpb3NSZXNwb25zZT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9hcGlDbGllbnQuZ2V0RGF0YShcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHN0b3JhZ2VDb250YWluZXIgPSB7XG4gICAgICAgICAgICBlcG9jaHRpbWU6IDAsXG4gICAgICAgICAgICBkYXRhOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDUwMCkgcmV0dXJuIHJlc3BvbnNlO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmRvd25sb2FkRGF0YUZyb21VcmwoXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLnVybCxcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuc2FsdF9kYXRhXG4gICAgICAgICk7XG4gICAgICAgIHN0b3JhZ2VDb250YWluZXIuZXBvY2h0aW1lID0gcmVzcG9uc2UuZGF0YS5lcG9jaHRpbWU7XG4gICAgICAgIC8vVEVTVFxuICAgICAgICBjb25zdCB0ZXN0ID0gbmV3IEZpbGUoW2RhdGFdLCBcInRlc3QuanNvblwiLCB7XG4gICAgICAgICAgICB0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHZhbCA9IGF3YWl0IHRlc3QudGV4dCgpO1xuICAgICAgICBzdG9yYWdlQ29udGFpbmVyLmRhdGEgPSB2YWw7XG4gICAgICAgIGNvbnNvbGUubG9nKHZhbCk7XG5cbiAgICAgICAgLy9URVNUXG4gICAgICAgIHJlc3BvbnNlLmRhdGFbXCJzdG9yYWdlXCJdID0gc3RvcmFnZUNvbnRhaW5lcjtcbiAgICAgICAgLy9kb3dubG9hZCBzdG9yYWdlIGZyb20gZ29vZ2xlIHN0b3JhZ2VcbiAgICAgICAgLy9zYXZlIGVuY3J5cHRlZCBmaWxlIHRvIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgLy9kZWNyeXB0IHRoZSBmaWxlIGFuZCBzaG93IGl0IG9uIHRoZSBmcm9udGVuZFxuICAgICAgICAvL1RPRE8gZGVmaW5lIHR5cGUgb2YgZW5jcnlwdGVkIHN0b3JhZ2VcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIC8vVE9ETyBhZGQgcmVzcG9uc2UgdHlwZVxuICAgIGFzeW5jIHNldFN0b3JhZ2Uoc3RvcmFnZTogRmlsZSwgbGFzdEVwb2NoUmVnaXN0ZXJlZDpzdHJpbmcpOiBQcm9taXNlPEF4aW9zUmVzcG9uc2U+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcInNldFN0b3JhZ2VcIik7XG5cbiAgICAgICAgY29uc3QgaXNMYXN0VXBsb2FkUmVzcG9uc2U6IEF4aW9zUmVzcG9uc2UgPVxuICAgICAgICBhd2FpdCB0aGlzLl9hcGlDbGllbnQuY2hlY2tJc0xhc3RVcGxvYWQodGhpcy5fdXNlcm5hbWUsIHBhcnNlSW50KGxhc3RFcG9jaFJlZ2lzdGVyZWQpKTtcbiAgICAgICAgXG4gICAgICAgIGlmICghaXNMYXN0VXBsb2FkUmVzcG9uc2UuZGF0YS5pc0xhc3RVcGxvYWQpIHtcbiAgICAgICAgICAgIGlzTGFzdFVwbG9hZFJlc3BvbnNlLnN0YXR1cyA9IDUwMDtcbiAgICAgICAgICAgIHJldHVybiBpc0xhc3RVcGxvYWRSZXNwb25zZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhpc0xhc3RVcGxvYWRSZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuICAgICAgICBjb25zdCB1cGxvYWRUaW1lOiBFcG9jaFRpbWVTdGFtcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIGNvbnN0IGZpbGVCaW5hcnlEYXRhID0gYXdhaXQgc3RvcmFnZT8uYXJyYXlCdWZmZXIoKTtcbiAgICAgICAgY29uc3QgZW5jcnlwdGVkRGF0YUZpbGVTdHJpbmdpZnkgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmVuY3J5cHREYXRhKFxuICAgICAgICAgICAgZmlsZUJpbmFyeURhdGEgYXMgQXJyYXlCdWZmZXJcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBlbmNyeXB0ZWREYXRhRmlsZUpTT04gPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgZW5jcnlwdGVkRGF0YUZpbGVTdHJpbmdpZnkgYXMgc3RyaW5nXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZERhdGFCdWZmZXIgPSB0aGlzLl9jcnlwdG9VdGlsLmNvbnZlcnRCYXNlNjRUb0J1ZmZlcihcbiAgICAgICAgICAgIGVuY3J5cHRlZERhdGFGaWxlSlNPTlswXT8uZW5jcnlwdGVkRGF0YVxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZEZpbGUgPSBuZXcgRmlsZShcbiAgICAgICAgICAgIFtlbmNyeXB0ZWREYXRhQnVmZmVyXSxcbiAgICAgICAgICAgIHN0b3JhZ2U/Lm5hbWUgYXMgc3RyaW5nLFxuICAgICAgICAgICAgeyB0eXBlOiBzdG9yYWdlPy50eXBlIH1cbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBmb3JtRGF0YTogRm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgICBmb3JtRGF0YS5hcHBlbmQoXCJteUZpbGVcIiwgZW5jcnlwdGVkRmlsZSBhcyBGaWxlKTtcblxuICAgICAgICB0aGlzLmNoZWNrQXBwZW5kZWRGb3JtRGF0YShmb3JtRGF0YSk7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlOiBBeGlvc1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5fYXBpQ2xpZW50LnVwbG9hZERhdGEoXG4gICAgICAgICAgICBmb3JtRGF0YSxcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lLFxuICAgICAgICAgICAgZW5jcnlwdGVkRGF0YUZpbGVKU09OWzBdPy5pdixcbiAgICAgICAgICAgIHVwbG9hZFRpbWVcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAxKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInZhdWx0X2RhdGFfZXBvY2h0aW1lXCIsIHVwbG9hZFRpbWUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBsZXQgZmlsZUNvbnRlbnQgPSBhd2FpdCBzdG9yYWdlLnRleHQoKTtcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGFbXCJzdG9yYWdlXCJdID0gZmlsZUNvbnRlbnQ7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlQ29udGVudCk7XG4gICAgICAgICAgICAvL1RPRE8gYWRkIHN0b3JhZ2UgdG8ganNvbiBvYmplY3RcbiAgICAgICAgICAgIC8vVE9ETyBhZGQgdG8gcmVzcG9uc2UgdGhlIHN0b3JhZ2VcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9XG5cbiAgICBhc3luYyBkb3dubG9hZFN0b3JhZ2VUb0Rpc2soKSB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzYWx0RGF0YVJlc3BvbnNlID0gYXdhaXQgdGhpcy5fYXBpQ2xpZW50LmdldERhdGFTYWx0KFxuICAgICAgICAgICAgdGhpcy5fdXNlcm5hbWVcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgc2FsdERhdGEgPSBzYWx0RGF0YVJlc3BvbnNlLmRhdGEuc2FsdDtcbiAgICAgICAgLy8gdGhpcy5fY3J5cHRvVXRpbC5kb3dubG9hZERhdGFGcm9tVXJsKGRvd25sb2FkVXJsLCBzYWx0RGF0YSk7XG4gICAgICAgIHRoaXMuX2NyeXB0b1V0aWwuZG93bmxvYWREYXRhRnJvbUxvY2FsU3RvcmFnZShzYWx0RGF0YSk7XG4gICAgfVxuXG4gICAgYXN5bmMgc3Vic2NyaWJlU3RvcmFnZSgpOiBQcm9taXNlPEV2ZW50U291cmNlUG9seWZpbGw+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9pbml0aWFsaXplZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IG5vdCBpbml0aWFsaXplZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoZWFkZXJzID0gYXdhaXQgdGhpcy5fYXBpQ2xpZW50LmdldEF1dGhvcml6YXRpb25IZWFkZXJzU3RvcmFnZShcbiAgICAgICAgICAgIHRoaXMuX3VzZXJuYW1lXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGV2ZW50U291cmNlID0gbmV3IEV2ZW50U291cmNlUG9seWZpbGwodGhpcy5fb3B0aW9ucy5hcGlPcHRpb25zLmJhc2VVcmwgKyBcIi9maWxlcy9zdG9yYWdlU3Vic2NyaXB0aW9uXCIsIGhlYWRlcnMpO1xuXG4gICAgICAgIHJldHVybiBldmVudFNvdXJjZTtcbiAgICB9XG4gICAgYXN5bmMgdW5zdWJzY3JpYmVTdG9yYWdlKGV2ZW50U291cmNlOiBFdmVudFNvdXJjZVBvbHlmaWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgZXZlbnRTb3VyY2UuY2xvc2UoKTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRSZWFkYWJsZVN0b3JhZ2UocmVzcG9uc2U6YW55KTogUHJvbWlzZTxTdG9yYWdlQ29udGFpbmVyPiB7XG4gICAgICAgIGlmICghdGhpcy5faW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN0b3JhZ2VDb250YWluZXIgPSB7XG4gICAgICAgICAgICBlcG9jaHRpbWU6IDAsXG4gICAgICAgICAgICBkYXRhOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJlc3BvbnNlLmRhdGEgPSBKU09OLnBhcnNlKHJlc3BvbnNlLmRhdGEpO1xuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLl9jcnlwdG9VdGlsLmRvd25sb2FkRGF0YUZyb21VcmwoXG4gICAgICAgICAgICByZXNwb25zZS5kYXRhLnVybCxcbiAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuc2FsdF9kYXRhXG4gICAgICAgICk7XG4gICAgICAgIHN0b3JhZ2VDb250YWluZXIuZXBvY2h0aW1lID0gcmVzcG9uc2UuZGF0YS5lcG9jaHRpbWU7XG4gICAgICAgIFxuICAgICAgICAvL1RFU1RcbiAgICAgICAgY29uc3QgZmlsZSA9IG5ldyBGaWxlKFtkYXRhXSwgXCJmaWxlLmpzb25cIiwge1xuICAgICAgICAgICAgdHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB2YWwgPSBhd2FpdCBmaWxlLnRleHQoKTtcbiAgICAgICAgc3RvcmFnZUNvbnRhaW5lci5kYXRhID0gdmFsO1xuXG4gICAgICAgIHJldHVybiBzdG9yYWdlQ29udGFpbmVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tBcHBlbmRlZEZvcm1EYXRhKGZvcm1EYXRhOiBGb3JtRGF0YSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBmb3JtRGF0YS5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50WzBdICsgXCIsIFwiICsgZWxlbWVudFsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgYXBwZW5kaW5nIGZpbGUgdG8gZm9ybSBkYXRhXCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19