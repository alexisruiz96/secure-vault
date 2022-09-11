"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const express_1 = __importDefault(require("express"));
const filesRouter_1 = __importDefault(require("./routes/filesRouter"));
const usersRouter_1 = __importDefault(require("./routes/usersRouter"));
const config_1 = require("./utils/config");
const i18n_1 = require("./i18n/i18n");
const app = (0, express_1.default)();
// Enables CORS for all requests
const cors_1 = __importDefault(require("cors"));
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
//add local passport
app.use("/users", usersRouter_1.default);
app.use("/files", filesRouter_1.default);
app.use((err, _req, res, _next) => {
    res.status(500).json({ message: err.message });
});
app.listen(parseInt(config_1.PORT), () => {
    console.log(i18n_1.i18n.serverStart, parseInt(config_1.PORT));
});
//# sourceMappingURL=app.js.map