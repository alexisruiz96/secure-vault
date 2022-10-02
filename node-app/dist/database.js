"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.client = void 0;
const pg_1 = require("pg");
const config_1 = require("./utils/config");
exports.client = new pg_1.Client({
    user: config_1.DB_USER,
    host: config_1.DB_HOST,
    database: config_1.DB_NAME,
    password: config_1.DB_PASSWORD,
    port: parseInt(config_1.DB_PORT),
});
exports.pool = new pg_1.Pool({
    user: config_1.DB_USER,
    host: config_1.DB_HOST,
    database: config_1.DB_NAME,
    password: config_1.DB_PASSWORD,
    port: parseInt(config_1.DB_PORT),
});
//# sourceMappingURL=database.js.map