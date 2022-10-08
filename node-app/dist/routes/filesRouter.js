"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const passport_1 = __importDefault(require("passport"));
const filesController_1 = require("../controllers/filesController");
const filesRouter = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({});
let upload = (0, multer_1.default)({ storage: storage });
filesRouter.post("/upload", passport_1.default.authorize("jwt", { session: false }), upload.single("myFile"), filesController_1.uploadFile);
filesRouter.get("/storage", passport_1.default.authorize("jwt", { session: false }), filesController_1.downloadFile);
filesRouter.get("/storageSubscription", passport_1.default.authorize("jwt", { session: false }), filesController_1.subscribeStorage);
filesRouter.get("/salt", passport_1.default.authorize("jwt", { session: false }), filesController_1.getDataSalt);
filesRouter.get("/checkuploadtime", passport_1.default.authorize("jwt", { session: false }), filesController_1.checkUploadTime);
// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);
filesRouter.delete("/delete/:id", filesController_1.deleteFile);
exports.default = filesRouter;
//# sourceMappingURL=filesRouter.js.map