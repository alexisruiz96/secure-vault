"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, username, password, epochtime, data, salt, email) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.epochtime = epochtime;
        this.data = data;
        this.salt = salt;
        this.email = email;
    }
}
exports.User = User;
