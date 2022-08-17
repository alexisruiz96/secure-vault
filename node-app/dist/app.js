"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const usersRouter_1 = __importDefault(require("./routes/usersRouter"));
const filesRouter_1 = __importDefault(require("./routes/filesRouter"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use('/users', usersRouter_1.default);
app.use('/files', filesRouter_1.default);
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.listen(4000, () => { console.log('Server started on port ', 4000); });
