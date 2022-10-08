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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUploadTime = exports.getDataSalt = exports.deleteFile = exports.subscribeStorage = exports.downloadFile = exports.uploadFile = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const promises_1 = require("stream/promises");
const storage_1 = require("@google-cloud/storage");
const database_1 = require("../database");
const i18n_1 = require("../i18n/i18n");
const config_1 = require("../utils/config");
const USERS = [];
//TODO check this to make it global
const gc = new storage_1.Storage({
    keyFilename: path_1.default.join(__dirname, "../../", config_1.SERVICE_ACCOUNT_KEY_FILE),
    projectId: config_1.GOOGLE_STORAGE_PROJECT_ID,
});
gc.getBuckets().then((results) => console.log(results));
const securevault_bucket = gc.bucket(config_1.GOOGLE_STORAGE_BUCKET_NAME);
function generateV4ReadSignedUrl(storage, bucketName, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        // These options will allow temporary read access to the file
        const options = {
            version: "v4",
            action: "read",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
        // Get a v4 signed URL for reading the file
        const [url] = yield storage
            .bucket(bucketName)
            .file(filename)
            .getSignedUrl(options);
        console.log("Generated GET signed URL:");
        console.log(url);
        return url;
    });
}
const uploadFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: i18n_1.i18n.fileNoFileUploaded });
        const { filename, mimetype, size } = req.file;
        console.log(req.file);
        //TODO add to the end of the file the original name
        const filename_user = `${req.headers.username}_${filename}`; //set filename to username_filename
        // USE CASES defined in google Drive project file
        //TODO check if is there any existing file related to that user
        //TODO upload the encrypted data to Google Storage
        yield (0, promises_1.pipeline)((0, fs_1.createReadStream)(req.file.path), securevault_bucket
            .file(filename_user)
            .createWriteStream({
            gzip: true,
            resumable: false,
            metadata: {
                contentType: mimetype,
            },
        })
            .on("error", (err) => {
            console.log(err);
        })
            .on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log("done");
            try {
                yield database_1.pool.query("UPDATE USERS SET data=$1, salt_data=$2, epochtime=$4 WHERE username like $3", [
                    filename_user,
                    req.headers.saltdata,
                    req.headers.username,
                    parseInt(req.headers.uploadtime),
                ]);
                const signedUrl = yield generateV4ReadSignedUrl(gc, config_1.GOOGLE_STORAGE_BUCKET_NAME, filename_user);
                res.status(201).json({
                    message: i18n_1.i18n.fileSuccessUploaded,
                    downloadActive: true,
                    downloadPage: signedUrl,
                });
            }
            catch (error) {
                res.status(500).json(i18n_1.i18n.errorServerUploadingFile);
            }
            //TODO Get the timestamp data from the cloud and store it in the database
        })));
        return res;
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Server Error: " + error);
    }
});
exports.uploadFile = uploadFile;
/**
 *
 * @param req contains the username to get the file
 * @param res return signed url to download the file and epochtime of the file
 * @param _next
 * @returns
 */
const downloadFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.query;
        const response = yield database_1.pool.query("SELECT data, epochtime, salt_data FROM USERS WHERE username LIKE $1", [user.username]);
        const signedUrl = yield generateV4ReadSignedUrl(gc, config_1.GOOGLE_STORAGE_BUCKET_NAME, response.rows[0].data);
        //TODO add functionality to return the corresponding file to the user
        return res.status(201).json({
            message: i18n_1.i18n.fileSuccessDownloaded,
            url: signedUrl,
            epochtime: response.rows[0].epochtime,
            salt_data: response.rows[0].salt_data,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: i18n_1.i18n.errorServerDownloadingFile });
    }
});
exports.downloadFile = downloadFile;
const subscribeStorage = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.set({
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive",
        });
        res.flushHeaders();
        // Tell the client to retry every 10 seconds if connectivity is lost
        res.write("retry: 10000\n\n");
        const user = req.headers.username;
        const response = yield database_1.pool.query("SELECT data, epochtime, salt_data FROM USERS WHERE username LIKE $1", [user]);
        const signedUrl = yield generateV4ReadSignedUrl(gc, config_1.GOOGLE_STORAGE_BUCKET_NAME, response.rows[0].data);
        yield new Promise((resolve) => setTimeout(resolve, 1000));
        res.write(`data: ${JSON.stringify({
            message: i18n_1.i18n.fileSuccessDownloaded,
            url: signedUrl,
            epochtime: response.rows[0].epochtime,
            salt_data: response.rows[0].salt_data,
        })}\n\n`);
        // Emit an SSE that contains the current 'count' as a string
        res.flushHeaders();
    }
    catch (error) {
        res.write(`message: ${i18n_1.i18n.storage_subscription_error}\n\n`);
    }
});
exports.subscribeStorage = subscribeStorage;
const deleteFile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.body;
        // await pool.query(
        //     'DELETE data FROM USERS WHERE id=$1',[req.params.id]
        // );
        return res.status(201).json(i18n_1.i18n.fileSuccessDeleted);
    }
    catch (error) {
        return res.status(500).json(i18n_1.i18n.errorServerDeletingFile);
    }
});
exports.deleteFile = deleteFile;
const getDataSalt = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.query;
        const response = yield database_1.pool.query("SELECT salt_data FROM USERS WHERE username LIKE $1;", [user.username]);
        return res.status(200).json({
            salt: response.rows[0].salt_data,
            message: i18n_1.i18n.serverChallenge,
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ isLogged: false, message: i18n_1.i18n.errorUsername });
    }
});
exports.getDataSalt = getDataSalt;
const checkUploadTime = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const params = req.query;
        const response = yield database_1.pool.query("SELECT epochtime FROM USERS WHERE username LIKE $1;", [params.username]);
        const isLastUpload = parseInt(params.uploadtime) >
            parseInt(response.rows[0].epochtime);
        if (!isLastUpload) {
            return res.status(200).json({
                isLastUpload: isLastUpload,
                message: i18n_1.i18n.storage_time_error,
            });
        }
        return res.status(200).json({
            isLastUpload: isLastUpload,
            message: i18n_1.i18n.storage_time_success,
        });
    }
    catch (error) {
        return res.status(500).json({ message: i18n_1.i18n.storage_time_check_error });
    }
});
exports.checkUploadTime = checkUploadTime;
//# sourceMappingURL=filesController.js.map