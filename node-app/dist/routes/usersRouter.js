"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const usersRouter = (0, express_1.Router)();
usersRouter.post("/signup", usersController_1.createUser);
usersRouter.get("/salt", usersController_1.getSalt);
usersRouter.post("/login", usersController_1.loginUser);
usersRouter.get("/", usersController_1.getUsers);
usersRouter.patch("/:id", usersController_1.updateUser);
usersRouter.delete("/:id", usersController_1.deleteUser);
exports.default = usersRouter;
//# sourceMappingURL=usersRouter.js.map