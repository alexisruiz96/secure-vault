"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const filesController_1 = require("../controllers/filesController");
const filesRouter = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({});
let upload = (0, multer_1.default)({ storage: storage });
filesRouter.post("/upload", upload.single("myFile"), filesController_1.uploadFile);
filesRouter.get("/download", filesController_1.downloadFile);
// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);
filesRouter.delete("/delete/:id", filesController_1.deleteFile);
exports.default = filesRouter;
//# sourceMappingURL=filesRouter.js.map