"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const usersController_1 = require("../controllers/usersController");
const usersRouter = (0, express_1.Router)();
usersRouter.post("/signup", usersController_1.createUser);
usersRouter.post("/login", passport_1.default.authenticate("local", { session: false }), usersController_1.loginUser);
usersRouter.get("/", passport_1.default.authorize("jwt", { session: false }), usersController_1.getUsers);
usersRouter.patch("/:id", passport_1.default.authorize("jwt", { session: false }), usersController_1.updateUser);
usersRouter.delete("/:id", passport_1.default.authorize("jwt", { session: false }), usersController_1.deleteUser);
exports.default = usersRouter;
//# sourceMappingURL=usersRouter.js.map