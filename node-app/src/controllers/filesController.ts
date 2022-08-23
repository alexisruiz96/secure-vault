import { NextFunction, Request, RequestHandler, Response } from "express";
import path from "path";
import { pbkdf2 } from "pbkdf2";
import { QueryResult } from "pg";
import { createReadStream, createWriteStream } from "fs";

import { Storage } from "@google-cloud/storage";
import * as base64 from "@juanelas/base64";

import { pool } from "../database";
import { pbkdf2Async } from "../utils/pbkdf2Async";

const USERS: File[] = [];

const gc = new Storage({
  keyFilename: path.join(
    __dirname,
    "../../secure-vault-360217-623afffad8b7.json"
  ),
  projectId: "secure-vault-360217",
});

gc.getBuckets().then((results) => console.log(results));

const bucket = gc.bucket("secure_vault_files");

export const uploadFile: RequestHandler = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    debugger;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { filename, mimetype, size } = req.file;
    console.log(req.file);
      
    createReadStream(req.file.path).pipe(
      bucket.file(filename).createWriteStream({
        gzip: true,
        resumable: false,
      })
      .on("error", (err) => console.log(err)).on("finish", () => {
        console.log("done");
      })
    );

    //TODO check if is there any existing file related to that user
    //TODO upload the encrypted data to Google Storage
    //TODO after this being done store the reference in the database
    // const response:QueryResult = await pool.query('INSERT INTO USERS (username, "password", epochtime, "data", salt, email) VALUES($1, $2, $3, $4, $5, $6);',
    //     [fileData.username, fileData]
    // );

    return res.status(201).json("File has been uploaded");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Server Error: " + error);
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
