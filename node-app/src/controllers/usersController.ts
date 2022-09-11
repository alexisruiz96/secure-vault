import { Request, RequestHandler, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { pbkdf2 } from 'pbkdf2';
import { QueryResult } from 'pg';

import * as base64 from '@juanelas/base64';

import { pool } from '../database';
import { i18n } from '../i18n/i18n';
import { Login, User as User } from '../models/userModel';
import { jwtSecret } from '../utils/config';
import * as crypto from 'crypto';

const USERS: User[] = [];

export const createUser: RequestHandler = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    debugger;
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
    await pool.query(
      'INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
      [
        user.username,
        derivedPwd,
        user.epochtime,
        data,
        serverSaltString,
        user.email,
      ]
    );

    return res.status(201).json(i18n.userSuccessCreated);
  } catch (error) {
    return res.status(500).json(i18n.errorServerCreatingUser);
  }
};

export const loginUser: RequestHandler = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    const user = req.body as Login;
    const saltRes: QueryResult = await pool.query(
      'SELECT salt FROM USERS WHERE username = $1;',
      [user.username]
    );

    if (saltRes.rowCount === 0 || saltRes.rows[0].salt === undefined) throw Error;

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

    if (response.rowCount===0 || !response.rows[0].exists) throw Error;
    
    const token = generateJwt(user);

    // Set jwt into a cookie
    res.cookie("auth", token, {
      httpOnly: true,
      secure: true,
    });

    return res.status(200).json({
      isLogged: true,
      message: "Server: Logged in",
      username: user.username,
    });
    
  } catch (error) {
    return res.status(500).json({
      isLogged: false,
      message: i18n.loginError,
    });
  }
};

const pbkdf2Async = async (
  password: string,
  salt: string,
  iterations: number,
  keylen: number,
  digest: string
): Promise<Error | string> => {
  return new Promise((res, rej) => {
    pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
      err ? rej(err) : res(base64.encode(derivedKey, true, false));
    });
  });
};

const generateJwt = (user: Login) => {
  const jwtClaims = {
    sub: user.username,
    iss: "localhost:4000",
    aud: "localhost:4000",
    exp: Math.floor(Date.now() / 1000) + 604800,
    role: "user",
  };

  return jwt.sign(jwtClaims, jwtSecret);
};

//BELLOW FUNCTIONS ARE NOT USED IN THE PROJECT FOR THE MOMENT//

export const getUsers: RequestHandler = async (
  _req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    const response: QueryResult = await pool.query("SELECT * FROM USERS");
    return res.status(200).json({ users: response.rows });
  } catch (error) {
    return res.status(500).json(i18n.serverInternalError);
  }
};

//GET /users/:id
export const getUserById: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    const response: QueryResult = await pool.query(
      "SELECT * FROM USERS WHERE id=$1",
      [req.params.id]
    );

    if (response.rows.length === 0) {
      return res.status(404).json(i18n.userNotFound);
    }
    return res.status(200).json({ users: response.rows });
  } catch (error) {
    return res.status(500).json(i18n.serverInternalError);
  }
};

//PUT /users/:id
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

//DELETE /users/:id
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
