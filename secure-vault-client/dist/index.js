export class SecureVaultClient {
    constructor(options) {
        this._options = options;
        this._initialized = false;
    }
    async initialize(password) {
        // derive auth key from password
        // derive enc key from password
        // save enc key into _encKey 
        // login to vault (returns auth_token)
        // save token into _auth_token
        this._initialized = true;
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
        // encrypt storage with enc key
        // save storage to vault
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsTUFBTSxPQUFPLGlCQUFpQjtJQU0xQixZQUFZLE9BQWdCO1FBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFRCxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQWdCO1FBQzdCLGdDQUFnQztRQUNoQywrQkFBK0I7UUFDL0IsNkJBQTZCO1FBQzdCLHNDQUFzQztRQUN0Qyw4QkFBOEI7UUFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVO1FBQ1osSUFBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUM7WUFDbEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QseUJBQXlCO1FBQ3pCLCtCQUErQjtRQUMvQixpQkFBaUI7SUFDckIsQ0FBQztJQUVELEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBWTtRQUN6QixJQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBQztZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7U0FDN0M7UUFDRCwrQkFBK0I7UUFDL0Isd0JBQXdCO0lBQzVCLENBQUM7Q0FFSiIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBPcHRpb25zIHtcbiAgICBiYXNlVXJsOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBTZWN1cmVWYXVsdENsaWVudHtcbiAgICBwcml2YXRlIF9vcHRpb25zOiBPcHRpb25zO1xuICAgIHByaXZhdGUgX2VuY0tleT86IHN0cmluZztcbiAgICBwcml2YXRlIF9hdXRoX3Rva2VuPzogc3RyaW5nO1xuICAgIHByaXZhdGUgX2luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogT3B0aW9ucyl7XG4gICAgICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9pbml0aWFsaXplZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGFzeW5jIGluaXRpYWxpemUocGFzc3dvcmQ6IHN0cmluZyl7XG4gICAgICAgIC8vIGRlcml2ZSBhdXRoIGtleSBmcm9tIHBhc3N3b3JkXG4gICAgICAgIC8vIGRlcml2ZSBlbmMga2V5IGZyb20gcGFzc3dvcmRcbiAgICAgICAgLy8gc2F2ZSBlbmMga2V5IGludG8gX2VuY0tleSBcbiAgICAgICAgLy8gbG9naW4gdG8gdmF1bHQgKHJldHVybnMgYXV0aF90b2tlbilcbiAgICAgICAgLy8gc2F2ZSB0b2tlbiBpbnRvIF9hdXRoX3Rva2VuXG4gICAgICAgIHRoaXMuX2luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhc3luYyBnZXRTdG9yYWdlKCl7XG4gICAgICAgIGlmKCF0aGlzLl9pbml0aWFsaXplZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDbGllbnQgbm90IGluaXRpYWxpemVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBzdG9yYWdlIGZyb20gdmF1bHRcbiAgICAgICAgLy8gZGVjcnlwdCBzdG9yYWdlIHdpdGggZW5jIGtleVxuICAgICAgICAvLyByZXR1cm4gc3RvcmFnZVxuICAgIH1cblxuICAgIGFzeW5jIHNldFN0b3JhZ2Uoc3RvcmFnZTogYW55KXtcbiAgICAgICAgaWYoIXRoaXMuX2luaXRpYWxpemVkKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNsaWVudCBub3QgaW5pdGlhbGl6ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5jcnlwdCBzdG9yYWdlIHdpdGggZW5jIGtleVxuICAgICAgICAvLyBzYXZlIHN0b3JhZ2UgdG8gdmF1bHRcbiAgICB9XG4gICAgXG59Il19