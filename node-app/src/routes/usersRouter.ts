import { Router } from "express";

import {
  createUser,
  deleteUser,
  getSalt,
  getUsers,
  loginUser,
  updateUser,
} from "../controllers/usersController";

const usersRouter = Router();

usersRouter.post("/signup", createUser);

usersRouter.get("/salt", getSalt);

usersRouter.post("/login", loginUser);

usersRouter.get("/", getUsers);

usersRouter.patch("/:id", updateUser);

usersRouter.delete("/:id", deleteUser);

export default usersRouter;
