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
exports.deleteFile = exports.downloadFile = exports.uploadFile = void 0;
const USERS = [];
const uploadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debugger;
        const fileData = req.body;
        // const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
        //     [fileData.username, fileData]
        // );
        return res.status(201).json('File has been uploaded');
    }
    catch (error) {
        return res.status(500).json('Error creating user due to ' + error);
    }
});
exports.uploadFile = uploadFile;
const downloadFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // await pool.query(
        //     'UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6',
        //     [user.username, user.password, user.epochtime, user.data, user.salt, req.params.id]
        // );
        return res.status(201).json('File has been retrieved');
    }
    catch (error) {
        return res.status(500).json('Error modifying file due to ' + error);
    }
});
exports.downloadFile = downloadFile;
const deleteFile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // await pool.query(
        //     'DELETE data FROM USERS WHERE id=$1',[req.params.id]
        // );
        return res.status(201).json('File has been deleted');
    }
    catch (error) {
        return res.status(500).json('Error deleting file due to ' + error);
    }
});
exports.deleteFile = deleteFile;
