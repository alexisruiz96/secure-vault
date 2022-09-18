import { QueryResult } from 'pg';
import { getUserById, getUsers } from '../controllers/usersController';

import { pool } from '../database';
import { Login, User } from '../models/userModel';
import { pbkdf2Async } from '../utils/pbkdf2Async';

export const userQuery = {
    async createUser(user: User): Promise<void> {
        try {
            await pool.query(
                'INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES ($1, $2, $3, $4, $5, $6);',
                [
                    user.username,
                    user.password,
                    user.epochtime,
                    user.data,
                    user.salt,
                    user.email,
                ]
            );
        } catch (error) {
            throw Error;
        }
    },

    async validateUser(user: Login): Promise<QueryResult> {
        try {
            const saltRes: QueryResult = await pool.query(
                "SELECT salt FROM USERS WHERE username = $1;",
                [user.username]
            );

            if (saltRes.rowCount === 0 || saltRes.rows[0].salt === undefined)
                throw Error;

            //TODO retrieve salt from db
            const derivedPwd = await pbkdf2Async(
                user.password,
                saltRes.rows[0].salt,
                100000,
                64,
                "sha512"
            );
            const response: QueryResult = await pool.query(
                'SELECT EXISTS ( SELECT DISTINCT * FROM users u WHERE username like $1 and "password" like $2 );',
                [user.username, derivedPwd]
            );
            if (response.rowCount === 0)
                throw Error;
            return response;
        } catch (error) {
            throw Error;
        }
    },

    async getUsers(): Promise<QueryResult> {
        try {
            const response: QueryResult = await pool.query(
                'SELECT * FROM USERS;'
            );
            return response;
        } catch (error) {
            throw Error;
        }
    },

    async getUserById(id: number): Promise<QueryResult> {
        try {
            const response: QueryResult = await pool.query(
                'SELECT * FROM USERS WHERE id=$1',
                [id]
            );
            return response;
        } catch (error) {
            throw Error;
        }
    },

    async getUserByUsername(username: string): Promise<QueryResult> {
        try {
            const response: QueryResult = await pool.query(
                'SELECT * FROM USERS WHERE username=$1',
                [username]
            );
            return response;
        } catch (error) {
            throw Error;
        }
    }
};
