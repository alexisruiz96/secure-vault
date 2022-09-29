import { CryptoUtil } from './modules/cryptoUtils';
import { ApiClient } from './api/axios';
export class SecureVaultClient {
    constructor(options) {
        this._options = options;
        this._initialized = false;
        this._cryptoUtil = new CryptoUtil(options.cryptoOptions);
        this._apiClient = new ApiClient(options.apiOptions.baseUrl, options.apiOptions.timeout);
    }
    async initialize(user) {
        const response = await this.login(user);
        if (response.status === 200) {
            const encKey = await this._cryptoUtil.generateKey(this._options.keyPrefixes.encKey + user.password, true);
            const cryptoKey = await this._cryptoUtil.generateCryptoKey(encKey);
            if (cryptoKey.length === 0)
                throw new Error("Error during login process");
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
    async signUp(username, password, email) {
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
    async login(user) {
        //TODO add try catch
        const newUser = { ...user };
        const authKey = await this._cryptoUtil.generateKey(this._options.keyPrefixes.authKey + newUser.password, true);
        newUser.password = authKey;
        const response = await this._apiClient.login(newUser);
        return response;
    }
    async logout() {
        // logout from vault
        // clear _auth_token
    }
    async getStorage() {
        if (!this._initialized) {
            throw new Error("Client not initialized");
        }
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
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBR2pELE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFRdEMsTUFBTSxPQUFPLGlCQUFpQjtJQVExQixZQUFZLE9BQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRUQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFnQjtRQUV6QixNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBRyxRQUFRLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBQztZQUN2QixNQUFNLE1BQU0sR0FBWSxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUN0RCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFDaEQsSUFBSSxDQUNQLENBQUM7WUFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsTUFBZ0IsQ0FBQyxDQUFDO1lBQzdFLElBQUcsU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO2dCQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7U0FDN0M7UUFDRCxnQ0FBZ0M7UUFDaEMsK0JBQStCO1FBQy9CLDZCQUE2QjtRQUM3QixzQ0FBc0M7UUFDdEMsOEJBQThCO1FBQzlCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLE9BQU8sUUFBUSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1FBQzFELGdDQUFnQztRQUNoQywrQkFBK0I7UUFDL0IsNEJBQTRCO1FBQzVCLHNDQUFzQztJQUMxQyxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBZ0I7UUFDeEIsb0JBQW9CO1FBQ3BCLE1BQU0sT0FBTyxHQUFHLEVBQUMsR0FBRyxJQUFJLEVBQUMsQ0FBQTtRQUN6QixNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFDcEQsSUFBSSxDQUNQLENBQUM7UUFDRixPQUFPLENBQUMsUUFBUSxHQUFHLE9BQWlCLENBQUM7UUFDckMsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUV0RCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBRUQsS0FBSyxDQUFDLE1BQU07UUFDUixvQkFBb0I7UUFDcEIsb0JBQW9CO0lBQ3hCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVTtRQUNaLElBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFDO1lBQ2xCLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUM3QztRQUNELHlCQUF5QjtRQUN6QiwrQkFBK0I7UUFDL0IsaUJBQWlCO0lBQ3JCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQVk7UUFDekIsSUFBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQiwrQkFBK0I7UUFDL0Isd0JBQXdCO0lBQzVCLENBQUM7Q0FFSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q3J5cHRvVXRpbH0gZnJvbSAnLi9tb2R1bGVzL2NyeXB0b1V0aWxzJztcbmltcG9ydCB7SUxvZ2luVXNlciwgSUtleVByZWZpeGVzLCBJQ3J5cHRvT3B0aW9ucywgSUFwaU9wdGlvbnMsIFZhdWx0S2V5fSBmcm9tICcuL2ludGVyZmFjZXMvaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBeGlvc1Jlc3BvbnNlIH0gZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHtBcGlDbGllbnR9IGZyb20gJy4vYXBpL2F4aW9zJztcbmludGVyZmFjZSBPcHRpb25zIHtcbiAgICBhcGlPcHRpb25zOiBJQXBpT3B0aW9ucztcbiAgICBrZXlQcmVmaXhlczogSUtleVByZWZpeGVzO1xuICAgIGNyeXB0b09wdGlvbnM6IElDcnlwdG9PcHRpb25zO1xuICAgIFxufVxuXG5leHBvcnQgY2xhc3MgU2VjdXJlVmF1bHRDbGllbnR7XG4gICAgcHJpdmF0ZSBfb3B0aW9uczogT3B0aW9ucztcbiAgICBwcml2YXRlIF9lbmNLZXk/OiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfYXV0aF90b2tlbj86IHN0cmluZztcbiAgICBwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9jcnlwdG9VdGlsOiBDcnlwdG9VdGlsO1xuICAgIHByaXZhdGUgX2FwaUNsaWVudDogQXBpQ2xpZW50O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogT3B0aW9ucyl7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jcnlwdG9VdGlsID0gbmV3IENyeXB0b1V0aWwob3B0aW9ucy5jcnlwdG9PcHRpb25zKTtcbiAgICAgICAgdGhpcy5fYXBpQ2xpZW50ID0gbmV3IEFwaUNsaWVudChvcHRpb25zLmFwaU9wdGlvbnMuYmFzZVVybCwgb3B0aW9ucy5hcGlPcHRpb25zLnRpbWVvdXQpO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXRpYWxpemUodXNlcjogSUxvZ2luVXNlcik6IFByb21pc2U8QXhpb3NSZXNwb25zZT57XG4gICAgICAgIFxuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLmxvZ2luKHVzZXIpO1xuICAgICAgICAgICAgaWYocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApe1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuY0tleTpWYXVsdEtleSA9IGF3YWl0IHRoaXMuX2NyeXB0b1V0aWwuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbnMua2V5UHJlZml4ZXMuZW5jS2V5ICsgdXNlci5wYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgdHJ1ZVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3J5cHRvS2V5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5nZW5lcmF0ZUNyeXB0b0tleShlbmNLZXkgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBpZihjcnlwdG9LZXkubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoXCJFcnJvciBkdXJpbmcgbG9naW4gcHJvY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jcnlwdG9VdGlsLmVuY0NyeXB0b0tleSA9IGNyeXB0b0tleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRlcml2ZSBhdXRoIGtleSBmcm9tIHBhc3N3b3JkXG4gICAgICAgICAgICAvLyBkZXJpdmUgZW5jIGtleSBmcm9tIHBhc3N3b3JkXG4gICAgICAgICAgICAvLyBzYXZlIGVuYyBrZXkgaW50byBfZW5jS2V5IFxuICAgICAgICAgICAgLy8gbG9naW4gdG8gdmF1bHQgKHJldHVybnMgYXV0aF90b2tlbilcbiAgICAgICAgICAgIC8vIHNhdmUgdG9rZW4gaW50byBfYXV0aF90b2tlblxuICAgICAgICAgICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIGFzeW5jIHNpZ25VcCh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBlbWFpbDogc3RyaW5nKXtcbiAgICAgICAgLy8gZGVyaXZlIGF1dGgga2V5IGZyb20gcGFzc3dvcmRcbiAgICAgICAgLy8gZGVyaXZlIGVuYyBrZXkgZnJvbSBwYXNzd29yZFxuICAgICAgICAvLyBzYXZlIGVuYyBrZXkgaW50byBfZW5jS2V5XG4gICAgICAgIC8vIGxvZ2luIHRvIHZhdWx0IChyZXR1cm5zIGF1dGhfdG9rZW4pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9naW5zIHNlY3VyZSB2YXVsdCBjbGllbnRcbiAgICAgKiBAcGFyYW0gdXNlciBcbiAgICAgKiBAcmV0dXJucyBsb2dpbiBzdGF0dXNcbiAgICAgKi9cbiAgICBhc3luYyBsb2dpbih1c2VyOiBJTG9naW5Vc2VyKTogUHJvbWlzZTxBeGlvc1Jlc3BvbnNlPntcbiAgICAgICAgLy9UT0RPIGFkZCB0cnkgY2F0Y2hcbiAgICAgICAgY29uc3QgbmV3VXNlciA9IHsuLi51c2VyfVxuICAgICAgICBjb25zdCBhdXRoS2V5ID0gYXdhaXQgdGhpcy5fY3J5cHRvVXRpbC5nZW5lcmF0ZUtleShcbiAgICAgICAgICAgIHRoaXMuX29wdGlvbnMua2V5UHJlZml4ZXMuYXV0aEtleSArIG5ld1VzZXIucGFzc3dvcmQsXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgICk7XG4gICAgICAgIG5ld1VzZXIucGFzc3dvcmQgPSBhdXRoS2V5IGFzIHN0cmluZztcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9hcGlDbGllbnQubG9naW4obmV3VXNlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH1cblxuICAgIGFzeW5jIGxvZ291dCgpe1xuICAgICAgICAvLyBsb2dvdXQgZnJvbSB2YXVsdFxuICAgICAgICAvLyBjbGVhciBfYXV0aF90b2tlblxuICAgIH1cbiAgICBcbiAgICBhc3luYyBnZXRTdG9yYWdlKCl7XG4gICAgICAgIGlmKCF0aGlzLl9pbml0aWFsaXplZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBzdG9yYWdlIGZyb20gdmF1bHRcbiAgICAgICAgLy8gZGVjcnlwdCBzdG9yYWdlIHdpdGggZW5jIGtleVxuICAgICAgICAvLyByZXR1cm4gc3RvcmFnZVxuICAgIH1cblxuICAgIGFzeW5jIHNldFN0b3JhZ2Uoc3RvcmFnZTogYW55KXtcbiAgICAgICAgaWYoIXRoaXMuX2luaXRpYWxpemVkKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJzZXRTdG9yYWdlXCIpO1xuICAgICAgICAvLyBlbmNyeXB0IHN0b3JhZ2Ugd2l0aCBlbmMga2V5XG4gICAgICAgIC8vIHNhdmUgc3RvcmFnZSB0byB2YXVsdFxuICAgIH1cbiAgICBcbn0iXX0=