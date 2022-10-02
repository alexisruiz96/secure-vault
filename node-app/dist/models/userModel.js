"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(_id, username, password, epochtime, data, salt, email) {
        this._id = _id;
        this.username = username;
        this.password = password;
        this.epochtime = epochtime;
        this.data = data;
        this.salt = salt;
        this.email = email;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
}
exports.User = User;
//# sourceMappingURL=userModel.js.map