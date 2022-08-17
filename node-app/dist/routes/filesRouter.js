"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const filesController_1 = require("../controllers/filesController");
const filesRouter = (0, express_1.Router)();
filesRouter.post('/', filesController_1.uploadFile);
filesRouter.get('/', filesController_1.downloadFile);
// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);
filesRouter.delete('/:id', filesController_1.deleteFile);
exports.default = filesRouter;
