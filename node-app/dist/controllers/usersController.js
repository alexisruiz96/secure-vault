"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.loginUser = exports.getSalt = exports.createUser = void 0;
const pbkdf2_1 = require("pbkdf2");
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../utils/config");
const base64 = __importStar(require("@juanelas/base64"));
const database_1 = require("../database");
const i18n_1 = require("../i18n/i18n");
const USERS = [];
const createUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debugger;
        const user = req.body;
        const derivedPwd = yield pbkdf2Async(user.password, user.salt, 100000, 64, "sha512");
        if (derivedPwd instanceof Error) {
            return res.status(500).send(derivedPwd.message);
        }
        const data = user.data !== "" ? user.data : null;
        yield database_1.pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);', [user.username, derivedPwd, user.epochtime, data, user.salt, user.email]);
        return res.status(201).json(i18n_1.i18n.userSuccessCreated);
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.errorServerCreatingUser);
    }
});
exports.createUser = createUser;
const getSalt = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.query;
        const response = yield database_1.pool.query("SELECT salt FROM USERS WHERE username LIKE $1;", [user.username]);
        return res.status(200).json({
            salt: response.rows[0].salt,
            message: i18n_1.i18n.serverChallenge,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ isLogged: false, message: i18n_1.i18n.errorUsername });
    }
});
exports.getSalt = getSalt;
const loginUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const derivedPwd = yield pbkdf2Async(user.password, user.salt, 100000, 64, "sha512");
        const response = yield database_1.pool.query('SELECT EXISTS ( SELECT DISTINCT * FROM users u WHERE username like $1 and "password" like $2 );', [user.username, derivedPwd]);
        if (response.rows[0].exists) {
            const token = generateJwt(user);
            // Set jwt into a cookie
            res.cookie("auth", token, {
                httpOnly: true,
                secure: true,
            });
            return res.status(200).json({
                isLogged: true,
                message: "Server: Logged in",
                username: user.username,
            });
        }
        else {
            return res.status(500).json({
                isLogged: false,
                message: i18n_1.i18n.loginError,
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            isLogged: false,
            message: i18n_1.i18n.loginError,
        });
    }
});
exports.loginUser = loginUser;
const pbkdf2Async = (password, salt, iterations, keylen, digest) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((res, rej) => {
        (0, pbkdf2_1.pbkdf2)(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            err ? rej(err) : res(base64.encode(derivedKey, true, false));
        });
    });
});
const generateJwt = (user) => {
    const jwtClaims = {
        sub: user.username,
        iss: "localhost:4000",
        aud: "localhost:4000",
        exp: Math.floor(Date.now() / 1000) + 604800,
        role: "user",
    };
    return jwt.sign(jwtClaims, config_1.jwtSecret);
};
//BELLOW FUNCTIONS ARE NOT USED IN THE PROJECT FOR THE MOMENT//
const getUsers = (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query("SELECT * FROM USERS");
        return res.status(200).json({ users: response.rows });
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.serverInternalError);
    }
});
exports.getUsers = getUsers;
//GET /users/:id
const getUserById = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query("SELECT * FROM USERS WHERE id=$1", [req.params.id]);
        if (response.rows.length === 0) {
            return res.status(404).json(i18n_1.i18n.userNotFound);
        }
        return res.status(200).json({ users: response.rows });
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.serverInternalError);
    }
});
exports.getUserById = getUserById;
//PUT /users/:id
const updateUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        yield database_1.pool.query("UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6", [
            user.username,
            user.password,
            user.epochtime,
            user.data,
            user.salt,
            req.params.id,
        ]);
        return res.status(201).json(i18n_1.i18n.userSuccessUpdated);
    }
    catch (error) {
        return res.status(500).json();
    }
});
exports.updateUser = updateUser;
//DELETE /users/:id
const deleteUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.pool.query("DELETE FROM USERS WHERE id=$1", [req.params.id]);
        return res.status(201).json(i18n_1.i18n.userSuccessDeleted);
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.errorServerDeletingUser);
    }
});
exports.deleteUser = deleteUser;
//# sourceMappingURL=usersController.js.map