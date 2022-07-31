import {Request, Response, NextFunction, RequestHandler} from 'express'
import {User as User} from '../models/user'
import {pool} from '../database'
import {QueryResult} from 'pg'

const USERS: User[] = [];

export const createUser: RequestHandler = async (req:Request, res: Response, next): Promise<Response> => {
    
    try {
        const user = ( req.body as User);
    
        const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt_c, email,salt) VALUES($1, $2, $3, $4, $5, $6, $7);',
            [user.username, user.password, user.epochtime, user.data, user.salt, user.email, ""]
        );
        
        return res.status(201).json('User has been created');
    } catch (error) {
        return res.status(500).json('Error creating user due to ' + error);
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