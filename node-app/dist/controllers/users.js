"use strict";
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
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const database_1 = require("../database");
const USERS = [];
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        const response = yield database_1.pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt_c, email,salt) VALUES($1, $2, $3, $4, $5, $6, $7);', [user.username, user.password, user.epochtime, user.data, user.salt, user.email, ""]);
        return res.status(201).json('User has been created');
    }
    catch (error) {
        return res.status(500).json('Error creating user due to ' + error);
    }
});
exports.createUser = createUser;
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM USERS');
        const result = response.rows[0].username;
        return res.status(200).json({ users: response.rows });
    }
    catch (error) {
        return res.status(500).json('Internal Server Error');
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT * FROM USERS WHERE id=$1', [req.params.id]);
        const result = response.rows[0].username;
        return res.status(200).json({ users: response.rows });
    }
    catch (error) {
        return res.status(500).json('Internal Server Error');
    }
});
exports.getUserById = getUserById;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        yield database_1.pool.query('UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6', [user.username, user.password, user.epochtime, user.data, user.salt, req.params.id]);
        return res.status(201).json('User has been modified');
    }
    catch (error) {
        return res.status(500).json('Error modifying user due to ' + error);
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        yield database_1.pool.query('DELETE FROM USERS WHERE id=$1', [req.params.id]);
        return res.status(201).json('User has been deleted');
    }
    catch (error) {
        return res.status(500).json('Error deleting user due to ' + error);
    }
});
exports.deleteUser = deleteUser;
