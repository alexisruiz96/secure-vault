import { AxiosResponse } from 'axios';

import { ApiClient } from './api/apiClient';
import {
    IApiOptions, ICryptoOptions, IKeyPrefixes, ILoginUser, User, VaultKey
} from './interfaces/interfaces';
import { CryptoUtil } from './modules/cryptoUtils';

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

    async signUp(user: User) {
        const authKey = await this._cryptoUtil.generateKey(
            this._options.keyPrefixes.authKey + user.password,
            true
        );
        let newUser = { ...user };
        newUser.password = authKey as string;

        this._apiClient.signUp(newUser);
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

    async setStorage(storage: any | File): Promise<AxiosResponse["data"]> {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
        console.log("setStorage");
        // encrypt storage with enc key
        // save storage to vault
        //TODO add check if storage is file
        if (storage instanceof File) {
            const fileBinaryData = await storage?.arrayBuffer();
            const encryptedDataFileStringify =
                await this._cryptoUtil.encryptData(
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
            // END ENCRYPT FILE BLOCK

            // formData.append("myFile", file as File);

            this.checkAppendedFormData(formData);
            const { data }: AxiosResponse["data"] =
                await this._apiClient.uploadData(
                    formData,
                    this._username,
                    encryptedDataFileJSON[0]?.iv
                );

            return { data };
        }
    }

    async downloadStorageToDisk(downloadUrl: string) {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }

        const saltDataResponse = await this._apiClient.getDataSalt(
            this._username
        );
        const saltData = saltDataResponse.data.salt;
        const cryptoUtil = this._cryptoUtil;
        const res = await fetch(downloadUrl as string, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        })
            .then((response) => response.body)
            .then((rb) => {
                if (rb === null) throw new Error("Response body is null");
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
                                const decryptedData =
                                    await cryptoUtil.decryptData(
                                        value,
                                        saltData
                                    );
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
                    })
            )
            .then((result) => {
                // Do things with result
                console.log(result);
            })
            .catch((e) => console.error(e.message));

        console.log(res);
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
