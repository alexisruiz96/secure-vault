import {Router} from 'express';

import{ createUser,loginUser, getUsers, updateUser, deleteUser, getSalt } from '../controllers/usersController'

const usersRouter = Router();

usersRouter.post('/signup',createUser);

usersRouter.get('/salt', getSalt);

usersRouter.post('/login',loginUser);

usersRouter.get('/',getUsers);

usersRouter.patch('/:id', updateUser);

usersRouter.delete('/:id', deleteUser);

export default usersRouter;