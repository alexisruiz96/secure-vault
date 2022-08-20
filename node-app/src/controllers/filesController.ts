import { NextFunction, Request, RequestHandler, Response } from "express";
import { pbkdf2 } from "pbkdf2";
import { QueryResult } from "pg";

import * as base64 from "@juanelas/base64";

import { pool } from "../database";
import { pbkdf2Async } from "../utils/pbkdf2Async";

const USERS: File[] = [];

export const uploadFile: RequestHandler = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    debugger;
    const fileData = req.body as File;

    //TODO check if is there any existing file related to that user
    //TODO upload the encrypted data to Google Storage
    //TODO after this being done store the reference in the database
    // const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
    //     [fileData.username, fileData]
    // );

    return res.status(201).json("File has been uploaded");
  } catch (error) {
    return res.status(500).json("Error creating user due to " + error);
  }
};

export const downloadFile: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
  _next
) => {
  try {
    const user = req.body as File;

    // await pool.query(
    //     'UPDATE USERS SET username=$1, password=$2, epochtime=$3, data=$4, salt=$5 WHERE id=$6',
    //     [user.username, user.password, user.epochtime, user.data, user.salt, req.params.id]
    // );

    return res.status(201).json("File has been retrieved");
  } catch (error) {
    return res.status(500).json("Error modifying file due to " + error);
  }
};

export const deleteFile: RequestHandler<{ id: string }> = async (
  req: Request,
  res: Response,
  _next
) => {
  try {
    const user = req.body as File;

    // await pool.query(
    //     'DELETE data FROM USERS WHERE id=$1',[req.params.id]
    // );

    return res.status(201).json("File has been deleted");
  } catch (error) {
    return res.status(500).json("Error deleting file due to " + error);
  }
};
