import {Router} from 'express';

import{ createUser,loginUser, getUsers, updateUser, deleteUser, getSalt } from '../controllers/users'

const router = Router();

router.post('/signup',createUser);

router.get('/salt', getSalt);

router.get('/login',loginUser);

router.get('/',getUsers);

router.patch('/:id', updateUser);

router.delete('/:id', deleteUser);

export default router;