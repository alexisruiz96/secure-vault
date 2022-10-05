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

export interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
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
        localStorage.removeItem("vault_data");
        localStorage.removeItem("vault_data_type");
        localStorage.removeItem("vault_data_upload_time");
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
        localStorage.removeItem("vault_data");
        localStorage.removeItem("vault_data_type");
        localStorage.removeItem("vault_data_upload_time");
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
        if (response.status === 500) return response;

        const data = await this._cryptoUtil.downloadDataFromUrl(
            response.data.url
        );
        localStorage.setItem(
            "vault_data_upload_time",
            response.data.epochtime.toString()
        );
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
        //TODO check epochtime de la base de datos para ese username
        //TODO add check if storage is file

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
            const encoder = new TextEncoder();
            const vault_type = this._cryptoUtil.convertBufferToBase64(
                encoder.encode(storage?.type as string)
            );

            localStorage.setItem(
                "vault_data",
                this._cryptoUtil.convertBufferToBase64(
                    encryptedDataBuffer as ArrayBuffer
                )
            );
            localStorage.setItem("vault_data_type", vault_type);
            localStorage.setItem(
                "vault_data_upload_time",
                uploadTime.toString()
            );
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
