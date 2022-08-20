"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.client = void 0;
const pg_1 = require("pg");
exports.client = new pg_1.Client({
    user: "kali",
    host: "localhost",
    database: "securevault",
    password: "kali",
    port: 5432,
});
exports.pool = new pg_1.Pool({
    user: "kali",
    host: "localhost",
    database: "securevault",
    password: "kali",
    port: 5432,
});
//# sourceMappingURL=database.js.map