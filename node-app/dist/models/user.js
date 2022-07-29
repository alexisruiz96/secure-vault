"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, username, password, versiontime, data, salt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.versiontime = versiontime;
        this.data = data;
        this.salt = salt;
    }
}
exports.User = User;
