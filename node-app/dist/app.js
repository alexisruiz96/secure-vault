"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
// Enables CORS for all requests
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const i18n_1 = require("./i18n/i18n");
const filesRouter_1 = __importDefault(require("./routes/filesRouter"));
const usersRouter_1 = __importDefault(require("./routes/usersRouter"));
const config_1 = require("./utils/config");
const passport_config_1 = require("./utils/passport-config");
const app = (0, express_1.default)();
var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
//TODO: Add the correct origin
app.use((0, cors_1.default)(corsOptions));
app.use((0, body_parser_1.json)());
passport_1.default.initialize();
(0, passport_config_1.initializePassportConfig)(passport_1.default);
app.use("/users", usersRouter_1.default);
app.use("/files", filesRouter_1.default);
app.use((err, _req, res, _next) => {
    res.status(500).json({ message: err.message });
});
app.listen(parseInt(config_1.PORT), () => {
    console.log(i18n_1.i18n.serverStart, parseInt(config_1.PORT));
});
//# sourceMappingURL=app.js.map