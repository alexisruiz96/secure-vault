import * as crypto from 'crypto';
import { Request, RequestHandler, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { QueryResult } from 'pg';

import * as base64 from '@juanelas/base64';

import { pool } from '../database';
import { userQuery } from '../db/userQuery';
import { i18n } from '../i18n/i18n';
import { Login, User as User } from '../models/userModel';
import { jwtSecret } from '../utils/config';
import { pbkdf2Async } from '../utils/pbkdf2Async';

const USERS: User[] = [];

/**
 * Create a new user
 * @param req Request
 * @param res Response
 * @param _next
 * @returns Response
 */
export const createUser: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const user = req.body as User;
        const serverSalt: Uint8Array = crypto.randomBytes(16);
        const serverSaltString = base64.encode(serverSalt, true, false);
        const derivedPwd = await pbkdf2Async(
            user.password,
            serverSaltString,
            100000,
            64,
            "sha512"
        );
        if (derivedPwd instanceof Error) {
            return res.status(500).send(derivedPwd.message);
        }
        const data = user.data !== "" ? user.data : null;
        const newUser = new User(
            0,
            user.username,
            derivedPwd,
            user.epochtime,
            data,
            serverSaltString,
            user.email
        );
        await userQuery.createUser(newUser);

        return res.status(201).json(i18n.userSuccessCreated);
    } catch (error) {
        return res.status(500).json(i18n.errorServerCreatingUser);
    }
};

//TODO: Add refresh token
/**
 * Login function executed when passport local validates the user
 * @param req
 * @param res
 * @param _next
 * @returns
 */
export const loginUser: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const user = req.body as Login;
        // const response: QueryResult = await userQuery.validateUser(user);

        // if(!response.rows[0].exists) throw Error;

        const token = generateJwt(user);

        /* Set jwt into a cookie
        res.cookie("auth", token, {
           httpOnly: true,
           secure: true,
        });*/

        return res.status(200).json({
            isLogged: true,
            message: "Server: Logged in",
            username: user.username,
            auth_token: token,
        });
    } catch (error) {
        return res.status(500).json({
            isLogged: false,
            message: i18n.loginError,
        });
    }
};

/**
 *
 * @param user {username, password}
 * @returns
 */
const generateJwt = (user: Login) => {
    //TODO: Save values in an env file
    const jwtClaims = {
        sub: user.username,
        iss: "localhost:4000",
        role: "user",
    };

    return jwt.sign(jwtClaims, jwtSecret, { expiresIn: "1h" });
};

//FUNCTIONS BELOW ARE NOT USED AT THE MOMENT//

/**
 * Get list of all users
 * @param _req
 * @param res
 * @param _next
 * @returns
 */
export const getUsers: RequestHandler = async (
    _req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const response: QueryResult = await userQuery.getUsers();
        return res.status(200).json({ users: response.rows });
    } catch (error) {
        return res.status(500).json(i18n.serverInternalError);
    }
};

/**
 * Get user by id
 * GET /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns user
 */
export const getUserById: RequestHandler<{ id: string }> = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const id = parseInt(req.params.id);
        const response: QueryResult = await userQuery.getUserById(id);

        if (response.rows.length === 0) {
            return res.status(404).json(i18n.userNotFound);
        }
        return res.status(200).json({ users: response.rows });
    } catch (error) {
        return res.status(500).json(i18n.serverInternalError);
    }
};

/**
 * Update user by id
 * PUT /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns response message
 */
export const updateUser: RequestHandler<{ id: string }> = async (
    req: Request,
    res: Response,
    _next
) => {
    try {
        const user = req.body as User;

        await pool.query(
            "UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6",
            [
                user.username,
                user.password,
                user.epochtime,
                user.data,
                user.salt,
                req.params.id,
            ]
        );

        return res.status(201).json(i18n.userSuccessUpdated);
    } catch (error) {
        return res.status(500).json();
    }
};

/**
 * Delete user by id
 * DELETE /users/:id
 * @param req
 * @param res
 * @param _next
 * @returns response message
 */
export const deleteUser: RequestHandler<{ id: string }> = async (
    req: Request,
    res: Response,
    _next
) => {
    try {
        await pool.query("DELETE FROM USERS WHERE id=$1", [req.params.id]);

        return res.status(201).json(i18n.userSuccessDeleted);
    } catch (error) {
        return res.status(500).json(i18n.errorServerDeletingUser);
    }
};
