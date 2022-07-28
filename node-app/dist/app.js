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
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const users_1 = __importDefault(require("./routes/users"));
const pg_1 = require("pg");
const client = new pg_1.Client({
    user: 'kali',
    host: 'localhost',
    database: 'securevault',
    password: 'kali',
    port: 5432,
});
const app = (0, express_1.default)();
// PostgreSQL connection
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect();
    const res = yield client.query('SELECT * FROM USERS');
    const result = res.rows[0].username;
    yield client.end();
    return result;
});
getUsers().then(res => { console.log(res); });
app.use((0, body_parser_1.json)());
app.use('/users', users_1.default);
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});
app.listen(3000);
