interface Options {
    baseUrl: string;
}

export class SecureVaultClient{
    private _options: Options;
    private _encKey?: string;
    private _auth_token?: string;
    private _initialized: boolean;

    constructor(options: Options){
        this._options = options;
        this._initialized = false;
    }

    async initialize(password: string){
        // derive auth key from password
        // derive enc key from password
        // save enc key into _encKey 
        // login to vault (returns auth_token)
        // save token into _auth_token
        this._initialized = true;
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