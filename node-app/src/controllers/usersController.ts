import {Request, Response, NextFunction, RequestHandler} from 'express'
import {User as User, Login, UserName} from '../models/userModel'
import {pool} from '../database'
import {QueryResult} from 'pg'
import { pbkdf2 } from "pbkdf2";
import * as base64 from '@juanelas/base64';

const USERS: User[] = [];

export const createUser: RequestHandler = async (req:Request, res: Response, next): Promise<Response> => {
    
    try {
        debugger;
        const user = ( req.body as User);
        const derivedPwd = await pbkdf2Async(user.password, user.salt, 100000, 64,'sha512');
        if (derivedPwd instanceof Error) {
            return res.status(500).send(derivedPwd.message);
        }
        const data = (user.data !== "") ? user.data : null;
        const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
            [user.username, derivedPwd, user.epochtime, data, user.salt, user.email]
        );
        
        return res.status(201).json('User has been created');
    } catch (error) {
        return res.status(500).json('Error creating user due to ' + error);
    }
};

const pbkdf2Async = async (password: string, salt: string, iterations: number, keylen: number, digest: string): Promise<Error | string> => {
    return new Promise( (res, rej) => {
        pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
            err ? rej(err) : res(base64.encode(derivedKey, true, false));
        });
    });
}

export const getSalt: RequestHandler = async (req:Request, res: Response, next): Promise<Response> => {
    
    try {
        
        const user = ( req.query as UserName);
    
        const response:QueryResult = await pool.query('SELECT salt FROM USERS WHERE username LIKE $1;',
            [user.username]
        );
        
        return res.status(200).json({salt: response.rows[0].salt, message:'Server: Solve the challenge'});
    } catch (error) {
        return res.status(500).json({isLogged: false, message:'Error with the username'});
    }
};

export const loginUser: RequestHandler = async (req:Request, res: Response, next): Promise<Response> => {
    debugger;
    try {
        debugger;
        const user = ( req.body as Login);
        const derivedPwd = await pbkdf2Async(user.password, user.salt, 100000, 64,'sha512');
        const response:QueryResult = await pool.query('SELECT EXISTS ( SELECT DISTINCT * FROM users u WHERE username like $1 and "password" like $2 );',
            [user.username, derivedPwd]
        );
        if (response.rows[0].exists) {
            return res.status(200).json({isLogged: true, message:'Server: Logged in', username: user.username});
        } else {
            return res.status(500).json({isLogged: false, message:'Server: Error with the username or password.'});
        }
    } catch (error) {
        return res.status(500).json({isLogged: false, message:'Server: Error with the username or password.'});
    }
};

export const getUsers: RequestHandler = async (req:Request, res: Response, next): Promise<Response> => {
    
    try {
        const response:QueryResult = await pool.query('SELECT * FROM USERS');
        const result = response.rows[0].username;
        return res.status(200).json({users: response.rows})        
    } catch (error) {
        return res.status(500).json('Internal Server Error');
    }
}

export const getUserById: RequestHandler<{id:string}> = async (req:Request, res: Response, next): Promise<Response> => {
    
    try {
        const response:QueryResult = await pool.query('SELECT * FROM USERS WHERE id=$1',[req.params.id]);
        const result = response.rows[0].username;
        return res.status(200).json({users: response.rows})        
    } catch (error) {
        return res.status(500).json('Internal Server Error');
    }
}

export const updateUser: RequestHandler<{id:string}> = async (req:Request, res: Response, next) => {
    try {
        const user = ( req.body as User);
    
        await pool.query(
            'UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6',
            [user.username, user.password, user.epochtime, user.data, user.salt, req.params.id]
        );
        
        return res.status(201).json('User has been modified');
    } catch (error) {
        return res.status(500).json('Error modifying user due to ' + error);
    }
}

export const deleteUser: RequestHandler<{id:string}> = async (req:Request, res: Response, next) => {

    try {
        const user = ( req.body as User);
    
        await pool.query(
            'DELETE FROM USERS WHERE id=$1',[req.params.id]
        );
        
        return res.status(201).json('User has been deleted');
    } catch (error) {
        return res.status(500).json('Error deleting user due to ' + error);
    }
}