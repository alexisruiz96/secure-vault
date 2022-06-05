"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const fs_1 = __importDefault(require("fs"));
const route_1 = require("kretes/route");
const response_1 = require("kretes/response");
exports.routes = [
    // implicit `return` with a `text/plain` response
    route_1.GET('/hello', (_request) => 'Hello, Kretes!'),
    route_1.GET('/json', (_request) => {
        // explicit `return` with a 200 response of `application/json` type
        return response_1.OK({ a: 1, b: 2 });
    }),
    route_1.GET('/stream', (_request) => {
        // stream the response
        return fs_1.default.createReadStream('static/index.html');
    }),
    route_1.GET('/headers', (_request) => {
        // set your own headers
        return { body: 'Hello B', statusCode: 201, headers: { Authorization: 'PASS' } };
    }),
    route_1.POST('/bim', (request) => {
        // request body is parsed in `params` by default
        return `Hello POST! ${request.params.name}`;
    }),
];
//# sourceMappingURL=index.js.map