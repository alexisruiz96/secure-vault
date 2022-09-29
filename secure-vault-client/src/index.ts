import {CryptoUtil} from './modules/cryptoUtils';
import {ILoginUser, IKeyPrefixes, ICryptoOptions, IApiOptions, VaultKey} from './interfaces/interfaces';
import { AxiosResponse } from 'axios';
import {ApiClient} from './api/axios';
interface Options {
    apiOptions: IApiOptions;
    keyPrefixes: IKeyPrefixes;
    cryptoOptions: ICryptoOptions;
    
}

export class SecureVaultClient{
    private _options: Options;
    private _encKey?: string;
    private _auth_token?: string;
    private _initialized: boolean;
    private _cryptoUtil: CryptoUtil;
    private _apiClient: ApiClient;

    constructor(options: Options){
        this._options = options;
        this._initialized = false;
        this._cryptoUtil = new CryptoUtil(options.cryptoOptions);
        this._apiClient = new ApiClient(options.apiOptions.baseUrl, options.apiOptions.timeout);
    }

    async initialize(user: ILoginUser): Promise<AxiosResponse>{
        
            const response = await this.login(user);
            if(response.status === 200){
                const encKey:VaultKey = await this._cryptoUtil.generateKey(
                    this._options.keyPrefixes.encKey + user.password,
                    true
                );
                const cryptoKey = await this._cryptoUtil.generateCryptoKey(encKey as string);
                if(cryptoKey.length === 0) throw new Error("Error during login process");
                this._cryptoUtil.encCryptoKey = cryptoKey;
            }
            // derive auth key from password
            // derive enc key from password
            // save enc key into _encKey 
            // login to vault (returns auth_token)
            // save token into _auth_token
            this._initialized = true;
            return response;
    }

    async signUp(username: string, password: string, email: string){
        // derive auth key from password
        // derive enc key from password
        // save enc key into _encKey
        // login to vault (returns auth_token)
    }

    /**
     * Logins secure vault client
     * @param user 
     * @returns login status
     */
    async login(user: ILoginUser): Promise<AxiosResponse>{
        //TODO add try catch
        const newUser = {...user}
        const authKey = await this._cryptoUtil.generateKey(
            this._options.keyPrefixes.authKey + newUser.password,
            true
        );
        newUser.password = authKey as string;
        const response = await this._apiClient.login(newUser);

        return response;
    }

    async logout(){
        // logout from vault
        // clear _auth_token
    }
    
    async getStorage(){
        if(!this._initialized){
            throw new Error("Client not initialized");
        }
        // get storage from vault
        // decrypt storage with enc key
        // return storage
    }

    async setStorage(storage: any){
        if(!this._initialized){
            throw new Error("Client not initialized");
        }
        console.log("setStorage");
        // encrypt storage with enc key
        // save storage to vault
    }
    
}