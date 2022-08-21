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
const uploadFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        debugger;
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const { filename, mimetype, size } = req.file;
        console.log(req.file);
        //TODO check if is there any existing file related to that user
        //TODO upload the encrypted data to Google Storage
        //TODO after this being done store the reference in the database
        // const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
        //     [fileData.username, fileData]
        // );
        return res.status(201).json("File has been uploaded");
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("Server Error: " + error);
    }
});
exports.uploadFile = uploadFile;
const downloadFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // await pool.query(
        //     'UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6',
        //     [user.username, user.password, user.epochtime, user.data, user.salt, req.params.id]
        // );
        return res.status(201).json("File has been retrieved");
    }
    catch (error) {
        return res.status(500).json("Error modifying file due to " + error);
    }
});
exports.downloadFile = downloadFile;
const deleteFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // await pool.query(
        //     'DELETE data FROM USERS WHERE id=$1',[req.params.id]
        // );
        return res.status(201).json("File has been deleted");
    }
    catch (error) {
        return res.status(500).json("Error deleting file due to " + error);
    }
});
exports.deleteFile = deleteFile;
//# sourceMappingURL=filesController.js.map