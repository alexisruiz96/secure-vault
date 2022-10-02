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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.loginUser = exports.createUser = void 0;
const crypto = __importStar(require("crypto"));
const jwt = __importStar(require("jsonwebtoken"));
const base64 = __importStar(require("@juanelas/base64"));
const database_1 = require("../database");
const userQuery_1 = require("../db/userQuery");
const i18n_1 = require("../i18n/i18n");
const userModel_1 = require("../models/userModel");
const config_1 = require("../utils/config");
const pbkdf2Async_1 = require("../utils/pbkdf2Async");
const USERS = [];
/**
 * Create a new user
 * @param req Request
 * @param res Response
 * @param _next
 * @returns Response
 */
const createUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const serverSalt = crypto.randomBytes(16);
        const serverSaltString = base64.encode(serverSalt, true, false);
        const derivedPwd = yield (0, pbkdf2Async_1.pbkdf2Async)(user.password, serverSaltString, 100000, 64, "sha512");
        if (derivedPwd instanceof Error) {
            return res.status(500).send(derivedPwd.message);
        }
        const data = user.data !== "" ? user.data : null;
        const newUser = new userModel_1.User(0, user.username, derivedPwd, user.epochtime, data, serverSaltString, user.email);
        yield userQuery_1.userQuery.createUser(newUser);
        return res.status(201).json(i18n_1.i18n.userSuccessCreated);
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.errorServerCreatingUser);
    }
});
exports.createUser = createUser;
//TODO: Add refresh token
/**
 * Login function executed when passport local validates the user
 * @param req
 * @param res
 * @param _next
 * @returns
 */
const loginUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // const response: QueryResult = await userQuery.validateUser(user);
        // if(!response.rows[0].exists) throw Error;
        const token = generateJwt(user);
        /* Set jwt into a cookie
        res.cookie("auth", token, {
           httpOnly: true,
           secure: true,
        });*/
        return res.status(200).json({
            isLogged: true,
            message: "Server: Logged in",
            username: user.username,
            auth_token: token,
        });
    }
    catch (error) {
        return res.status(500).json({
            isLogged: false,
            message: i18n_1.i18n.loginError,
        });
    }
});
exports.loginUser = loginUser;
/**
 *
 * @param user {username, password}
 * @returns
 */
const generateJwt = (user) => {
    //TODO: Save values in an env file
    const jwtClaims = {
        sub: user.username,
        iss: "localhost:4000",
        role: "user",
    };
    return jwt.sign(jwtClaims, config_1.jwtSecret, { expiresIn: "1h" });
};
//FUNCTIONS BELOW ARE NOT USED AT THE MOMENT//
/**
 * Get list of all users
 * @param _req
 * @param res
 * @param _next
 * @returns
 */
const getUsers = (_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield userQuery_1.userQuery.getUsers();
        return res.status(200).json({ users: response.rows });
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.serverInternalError);
    }
});
exports.getUsers = getUsers;
/**
 * Get user by id
 * GET /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns user
 */
const getUserById = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const response = yield userQuery_1.userQuery.getUserById(id);
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
/**
 * Update user by id
 * PUT /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns response message
 */
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
/**
 * Delete user by id
 * DELETE /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns response message
 */
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