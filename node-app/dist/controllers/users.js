"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUsers = exports.createUser = void 0;
const user_1 = require("../models/user");
const USERS = [];
const createUser = (req, res, next) => {
    const text = req.body.text;
    const id = Math.random().toString();
    const newUser = new user_1.User(id, text);
    USERS.push(newUser);
    res.status(201).json({ message: 'Created the user.', createdUser: newUser });
};
exports.createUser = createUser;
const getUsers = (req, res, next) => {
    res.json({ users: USERS });
};
exports.getUsers = getUsers;
const updateUser = (req, res, next) => {
    const userId = req.params.id;
    const updatedText = req.body.text;
    const userIndex = USERS.findIndex(user => user.id === userId);
    if (userIndex < 0) {
        throw new Error('Could not find user!');
    }
    USERS[userIndex] = new user_1.User(USERS[userIndex].id, updatedText);
    res.json({ message: 'Updated', updatedUser: USERS[userIndex] });
};
exports.updateUser = updateUser;
const deleteUser = (req, res, next) => {
    const userId = req.params.id;
    const updatedText = req.body.text;
    const userIndex = USERS.findIndex(user => user.id === userId);
    if (userIndex < 0) {
        throw new Error('Could not find user!');
    }
    USERS.splice(userIndex, 1);
    res.json({ message: 'User deleted!' });
};
exports.deleteUser = deleteUser;
