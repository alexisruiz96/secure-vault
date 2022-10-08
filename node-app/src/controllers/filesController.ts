import { Request, RequestHandler, Response } from "express";
import { createReadStream } from "fs";
import path from "path";
import { QueryResult } from "pg";
import { pipeline } from "stream/promises";

import { GetSignedUrlConfig, Storage } from "@google-cloud/storage";

import { pool } from "../database";
import { i18n } from "../i18n/i18n";
import { UserName } from "../models/userModel";
import {
    GOOGLE_STORAGE_BUCKET_NAME,
    GOOGLE_STORAGE_BUCKET_URL,
    GOOGLE_STORAGE_PROJECT_ID,
    SERVICE_ACCOUNT_KEY_FILE,
} from "../utils/config";

const USERS: File[] = [];

//TODO check this to make it global
const gc = new Storage({
    keyFilename: path.join(__dirname, "../../", SERVICE_ACCOUNT_KEY_FILE),
    projectId: GOOGLE_STORAGE_PROJECT_ID,
});

gc.getBuckets().then((results) => console.log(results));

const securevault_bucket = gc.bucket(GOOGLE_STORAGE_BUCKET_NAME);

async function generateV4ReadSignedUrl(
    storage: Storage,
    bucketName: string,
    filename: string
): Promise<string> {
    // These options will allow temporary read access to the file
    const options: GetSignedUrlConfig = {
        version: "v4",
        action: "read",
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    // Get a v4 signed URL for reading the file
    const [url] = await storage
        .bucket(bucketName)
        .file(filename)
        .getSignedUrl(options);

    console.log("Generated GET signed URL:");
    console.log(url);

    return url;
}

export const uploadFile: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        if (!req.file)
            return res.status(400).json({ message: i18n.fileNoFileUploaded });

        const { filename, mimetype, size } = req.file;
        console.log(req.file);
        //TODO add to the end of the file the original name
        const filename_user = `${req.headers.username}_${filename}`; //set filename to username_filename
        // USE CASES defined in google Drive project file
        //TODO check if is there any existing file related to that user
        //TODO upload the encrypted data to Google Storage

        await pipeline(
            createReadStream(req.file.path),
            securevault_bucket
                .file(filename_user)
                .createWriteStream({
                    gzip: true,
                    resumable: false,
                    metadata: {
                        contentType: mimetype,
                    },
                })
                .on("error", (err) => {
                    console.log(err);
                })
                .on("finish", async () => {
                    console.log("done");
                    try {
                        await pool.query(
                            "UPDATE USERS SET data=$1, salt_data=$2, epochtime=$4 WHERE username like $3",
                            [
                                filename_user,
                                req.headers.saltdata,
                                req.headers.username,
                                parseInt(req.headers.uploadtime as string),
                            ]
                        );
                        const signedUrl = await generateV4ReadSignedUrl(
                            gc,
                            GOOGLE_STORAGE_BUCKET_NAME,
                            filename_user
                        );

                        res.status(201).json({
                            message: i18n.fileSuccessUploaded,
                            downloadActive: true,
                            downloadPage: signedUrl,
                        });
                    } catch (error) {
                        res.status(500).json(i18n.errorServerUploadingFile);
                    }

                    //TODO Get the timestamp data from the cloud and store it in the database
                })
        );

        return res;
    } catch (error) {
        console.error(error);
        return res.status(500).json("Server Error: " + error);
    }
};

/**
 *
 * @param req contains the username to get the file
 * @param res return signed url to download the file and epochtime of the file
 * @param _next
 * @returns
 */
export const downloadFile: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const user = req.query as UserName;
        const response: QueryResult = await pool.query(
            "SELECT data, epochtime, salt_data FROM USERS WHERE username LIKE $1",
            [user.username]
        );
        const signedUrl = await generateV4ReadSignedUrl(
            gc,
            GOOGLE_STORAGE_BUCKET_NAME,
            response.rows[0].data
        );
        //TODO add functionality to return the corresponding file to the user
        return res.status(201).json({
            message: i18n.fileSuccessDownloaded,
            url: signedUrl,
            epochtime: response.rows[0].epochtime,
            salt_data: response.rows[0].salt_data,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ message: i18n.errorServerDownloadingFile });
    }
};

export const subscribeStorage: RequestHandler = async (
    req: Request,
    res: Response,
    _next
) => {
    try {
        res.set({
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive",
        });
        res.flushHeaders();

        // Tell the client to retry every 10 seconds if connectivity is lost
        res.write("retry: 10000\n\n");

        const user = req.headers.username as string;
        
        const interval = setInterval(async () => {
            const response: QueryResult = await pool.query(
                "SELECT data, epochtime, salt_data FROM USERS WHERE username LIKE $1",
                [user]
            );
            const signedUrl = await generateV4ReadSignedUrl(
                gc,
                GOOGLE_STORAGE_BUCKET_NAME,
                response.rows[0].data
            );
            res.write(
                `data: ${JSON.stringify({
                    message: i18n.fileSuccessDownloaded,
                    url: signedUrl,
                    epochtime: response.rows[0].epochtime,
                    salt_data: response.rows[0].salt_data,
                })}\n\n`
            );
        }, 10000);
        res.flushHeaders();
            
        req.on("close", () => {
            console.log("Client closed connection");
            clearInterval(interval);
            res.end();
        });

        
    } catch (error) {
        res.write(`message: ${i18n.storage_subscription_error}\n\n`);
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

        return res.status(201).json(i18n.fileSuccessDeleted);
    } catch (error) {
        return res.status(500).json(i18n.errorServerDeletingFile);
    }
};

export const getDataSalt: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const user = req.query as UserName;

        const response: QueryResult = await pool.query(
            "SELECT salt_data FROM USERS WHERE username LIKE $1;",
            [user.username]
        );

        return res.status(200).json({
            salt: response.rows[0].salt_data,
            message: i18n.serverChallenge,
        });
    } catch (error) {
        return res
            .status(500)
            .json({ isLogged: false, message: i18n.errorUsername });
    }
};

export const checkUploadTime: RequestHandler = async (
    req: Request,
    res: Response,
    _next
): Promise<Response> => {
    try {
        const params = req.query;

        const response: QueryResult = await pool.query(
            "SELECT epochtime FROM USERS WHERE username LIKE $1;",
            [params.username]
        );

        const isLastUpload =
            parseInt(params.uploadtime as string) ===
            parseInt(response.rows[0].epochtime as string);

        if (!isLastUpload) {
            return res.status(200).json({
                isLastUpload: isLastUpload,
                message: i18n.storage_time_error,
            });
        }
        return res.status(200).json({
            isLastUpload: isLastUpload,
            message: i18n.storage_time_success,
        });
    } catch (error) {
        return res.status(500).json({ message: i18n.storage_time_check_error });
    }
};
