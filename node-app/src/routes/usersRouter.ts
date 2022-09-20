import { Router } from 'express';
import passport from 'passport';

import {
    createUser, deleteUser, getUsers, loginUser, updateUser
} from '../controllers/usersController';

const usersRouter = Router();

usersRouter.post("/signup", createUser);

usersRouter.post(
    "/login",
    passport.authenticate("local", { session: false }),
    loginUser
);

usersRouter.get("/", passport.authorize("jwt", { session: false }), getUsers);

usersRouter.patch(
    "/:id",
    passport.authorize("jwt", { session: false }),
    updateUser
);

usersRouter.delete(
    "/:id",
    passport.authorize("jwt", { session: false }),
    deleteUser
);

export default usersRouter;
