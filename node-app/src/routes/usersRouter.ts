import { Router } from "express";

import {
  createUser,
  deleteUser,
  getUsers,
  loginUser,
  updateUser,
} from "../controllers/usersController";

const usersRouter = Router();

usersRouter.post("/signup", createUser);

usersRouter.post("/login", loginUser);

usersRouter.get("/", getUsers);

usersRouter.patch("/:id", updateUser);

usersRouter.delete("/:id", deleteUser);

export default usersRouter;
