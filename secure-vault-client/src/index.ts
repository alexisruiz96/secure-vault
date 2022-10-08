import { AxiosResponse } from "axios";

import { ApiClient } from "./api/apiClient";
import {
    IApiOptions,
    ICryptoOptions,
    IKeyPrefixes,
    ILoginUser,
    User,
    VaultKey,
} from "./interfaces/interfaces";
import { CryptoUtil } from "./modules/cryptoUtils";
import fs from "fs";
import { EventSourcePolyfill } from "event-source-polyfill";

export interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
}
export interface StorageContainer {
    epochtime: number;
    data: string;
}

export class SecureVaultClient {
    private _options: Options;
    private _initialized: boolean;
    private _cryptoUtil: CryptoUtil;
    private _apiClient: ApiClient;
    private _username: string;

    constructor(options: Options) {
        this._options = options;
        this._initialized = false;
        this._cryptoUtil = new CryptoUtil(options.cryptoOptions);
        this._apiClient = new ApiClient(
            options.apiOptions.baseUrl,
            options.apiOptions.timeout
        );
        this._username = "";
    }

    async initialize(user: ILoginUser): Promise<AxiosResponse> {
        const response = await this.login(user);
        if (response.status === 200) {
            this._username = user.username;
            const encKey: VaultKey = await this._cryptoUtil.generateKey(
                this._options.keyPrefixes.encKey + user.password,
                true
            );
            const cryptoKey = await this._cryptoUtil.generateCryptoKey(
                encKey as string
            );
            if (cryptoKey.length === 0)
                throw new Error("Error during login process");
            this._cryptoUtil.encCryptoKey = cryptoKey;
        }
        //TODO check if there is storage in vault and retrieve it
        this._initialized = true;
        return response;
    }

    async signUp(user: User): Promise<number> {
        const authKey = await this._cryptoUtil.generateKey(
            this._options.keyPrefixes.authKey + user.password,
            true
        );
        let newUser = { ...user };
        newUser.password = authKey as string;

        const status = await this._apiClient.signUp(newUser);
        return status;
    }

    /**
     * Logins secure vault client
     * @param user
     * @returns login status
     */
    async login(user: ILoginUser): Promise<AxiosResponse> {
        //TODO add try catch
        const newUser = { ...user };
        const authKey = await this._cryptoUtil.generateKey(
            this._options.keyPrefixes.authKey + newUser.password,
            true
        );
        newUser.password = authKey as string;
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

    async getStorage(): Promise<AxiosResponse> {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }

        const response: AxiosResponse = await this._apiClient.getData(
            this._username
        );

        let storageContainer = {
            epochtime: 0,
            data: "",
        };

        if (response.status === 500) return response;

        const data = await this._cryptoUtil.downloadDataFromUrl(
            response.data.url,
            response.data.salt_data
        );
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
    async setStorage(storage: File): Promise<AxiosResponse> {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("setStorage");

        const uploadTime: EpochTimeStamp = new Date().getTime();
        const isLastUploadResponse: AxiosResponse =
            await this._apiClient.checkIsLastUpload(this._username, uploadTime);

        if (!isLastUploadResponse.data.isLastUpload) {
            isLastUploadResponse.status = 500;
            return isLastUploadResponse;
        }
        console.log(isLastUploadResponse.data.message);

        const fileBinaryData = await storage?.arrayBuffer();
        const encryptedDataFileStringify = await this._cryptoUtil.encryptData(
            fileBinaryData as ArrayBuffer
        );

        const encryptedDataFileJSON = JSON.parse(
            encryptedDataFileStringify as string
        );
        const encryptedDataBuffer = this._cryptoUtil.convertBase64ToBuffer(
            encryptedDataFileJSON[0]?.encryptedData
        );

        const encryptedFile = new File(
            [encryptedDataBuffer],
            storage?.name as string,
            { type: storage?.type }
        );

        const formData: FormData = new FormData();

        formData.append("myFile", encryptedFile as File);

        this.checkAppendedFormData(formData);
        const response: AxiosResponse = await this._apiClient.uploadData(
            formData,
            this._username,
            encryptedDataFileJSON[0]?.iv,
            uploadTime
        );
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

        const saltDataResponse = await this._apiClient.getDataSalt(
            this._username
        );
        const saltData = saltDataResponse.data.salt;
        // this._cryptoUtil.downloadDataFromUrl(downloadUrl, saltData);
        this._cryptoUtil.downloadDataFromLocalStorage(saltData);
    }

    async subscribeStorage(): Promise<EventSourcePolyfill> {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        const headers = await this._apiClient.getAuthorizationHeadersStorage(
            this._username
        );
        const eventSource = new EventSourcePolyfill(this._options.apiOptions.baseUrl + "/files/storageSubscription", headers);

        return eventSource;
    }
    async unsubscribeStorage(eventSource: EventSourcePolyfill) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        eventSource.close();
    }

    async getReadableStorage(response:any): Promise<StorageContainer> {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        let storageContainer = {
            epochtime: 0,
            data: "",
        };

        response.data = JSON.parse(response.data);

        const data = await this._cryptoUtil.downloadDataFromUrl(
            response.data.url,
            response.data.salt_data
        );
        storageContainer.epochtime = response.data.epochtime;
        
        //TEST
        const file = new File([data], "file.json", {
            type: "application/json",
        });
        const val = await file.text();
        storageContainer.data = val;

        return storageContainer;
    }

    private checkAppendedFormData(formData: FormData) {
        try {
            for (let element of formData.entries()) {
                console.log(element[0] + ", " + element[1]);
            }
        } catch (error) {
            console.log(error);
            throw new Error("Error during appending file to form data");
        }
    }
}
