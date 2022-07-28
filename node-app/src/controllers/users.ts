import {Request, Response, NextFunction, RequestHandler} from 'express'
import {User as User} from '../models/user'

const USERS: User[] = [];

export const createUser: RequestHandler = (req, res, next) => {
    const text = ( req.body as {text:string}).text;
    const id: string = Math.random().toString();

    const newUser = new User(id, text);

    USERS.push(newUser);

    res.status(201).json({message: 'Created the user.', createdUser: newUser});
};

export const getUsers: RequestHandler = (req, res, next) => {
    res.json({users: USERS});
}

export const updateUser: RequestHandler<{id:string}> = (req, res, next) => {
    const userId = req.params.id;

    const updatedText = (req.body as {text: string}).text;
    
    const userIndex = USERS.findIndex(user => user.id === userId);
    if(userIndex < 0) {
        throw new Error('Could not find user!');
    }

    USERS[userIndex] = new User(USERS[userIndex].id, updatedText);

    res.json({message: 'Updated', updatedUser: USERS[userIndex]});
}

export const deleteUser: RequestHandler = (req, res, next) => {

    const userId = req.params.id;

    const updatedText = (req.body as {text: string}).text;
    
    const userIndex = USERS.findIndex(user => user.id === userId);
    if(userIndex < 0) {
        throw new Error('Could not find user!');
    }

    USERS.splice(userIndex, 1);

    res.json({message: 'User deleted!'});
}