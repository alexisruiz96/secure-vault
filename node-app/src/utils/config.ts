import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

export const SERVICE_ACCOUNT_KEY_FILE = process.env.SERVICE_ACCOUNT_KEY_FILE as string;
export const GOOGLE_STORAGE_PROJECT_ID = process.env.GOOGLE_STORAGE_PROJECT_ID as string;
export const GOOGLE_STORAGE_BUCKET_NAME = process.env.GOOGLE_STORAGE_BUCKET_NAME as string;
export const GOOGLE_STORAGE_BUCKET_URL = process.env.GOOGLE_STORAGE_BUCKET_URL as string;
export const PORT = process.env.PORT as string;

export const jwtSecret = crypto.randomBytes(16);