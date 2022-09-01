import { Request, RequestHandler, Response } from 'express';
import { createReadStream} from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { SERVICE_ACCOUNT_KEY_FILE, GOOGLE_STORAGE_PROJECT_ID,GOOGLE_STORAGE_BUCKET_NAME, GOOGLE_STORAGE_BUCKET_URL } from "../utils/config";

import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';

import { pool } from '../database';
import { i18n } from "../i18n/i18n";

const USERS: File[] = [];

//TODO check this to make it global
const gc = new Storage({
  keyFilename: path.join(
    __dirname,
    "../../",
    SERVICE_ACCOUNT_KEY_FILE
  ),
  projectId: GOOGLE_STORAGE_PROJECT_ID,
});

gc.getBuckets().then((results) => console.log(results));

const securevault_bucket = gc.bucket(GOOGLE_STORAGE_BUCKET_NAME);

async function generateV4ReadSignedUrl(storage: Storage, bucketName: string, filename: string): Promise<string> {
  // These options will allow temporary read access to the file
  const options: GetSignedUrlConfig = {
    version: 'v4',
    action: "read",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  // Get a v4 signed URL for reading the file
  const [url] = await storage
    .bucket(bucketName)
    .file(filename)
    .getSignedUrl(options);
    
    console.log('Generated GET signed URL:');
    console.log(url);

  return url;
}


export const uploadFile: RequestHandler = async (
  req: Request,
  res: Response,
  _next
): Promise<Response> => {
  try {
    debugger;

    if (!req.file) return res.status(400).json({ message: i18n.fileNoFileUploaded });

    const { filename, mimetype, size } = req.file;
    console.log(req.file);
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
          }
        })
        .on("error", (err) => {
          
          console.log(err)})
        .on("finish", async () => {
          console.log("done");
          try {
            await pool.query(
              "UPDATE USERS SET data=$1 WHERE username like $2",
              [filename_user, req.headers.username]
            );
            const signedUrl = await generateV4ReadSignedUrl(gc, GOOGLE_STORAGE_BUCKET_NAME, filename_user);
            
            res.status(201).json(
              {
                message: i18n.fileSuccessUploaded,
                downloadActive: true,
                downloadPage: signedUrl
              });
          } catch (error) {
            res.status(500).json(i18n.errorServerUploadingFile);
          }

          //TODO Get the timestamp data from the cloud and store it in the database
        })
    );

    return res;
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

    return res.status(201).json(i18n.fileSuccessDownloaded);
  } catch (error) {
    return res.status(500).json(i18n.errorServerDownloadingFile);
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
