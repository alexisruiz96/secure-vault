import * as dotenv from "dotenv";
import * as crypto from "crypto";

dotenv.config();

export const SERVICE_ACCOUNT_KEY_FILE = process.env.SERVICE_ACCOUNT_KEY_FILE as string;
export const GOOGLE_STORAGE_PROJECT_ID = process.env.GOOGLE_STORAGE_PROJECT_ID as string;
export const GOOGLE_STORAGE_BUCKET_NAME = process.env.GOOGLE_STORAGE_BUCKET_NAME as string;
export const GOOGLE_STORAGE_BUCKET_URL = process.env.GOOGLE_STORAGE_BUCKET_URL as string;
export const PORT = process.env.PORT as string;

export const jwtSecret = crypto.randomBytes(16);
export const JWT_ISSUER = process.env.JWT_ISSUER as string;

export const i18n_to_add = {
    userNotFound: {
        message: "User not found",
        code: 404,
    },
    serverInternalError: {
        message: "Server internal error",
        code: 500,
    },
    userAlreadyExists: {
        message: "User already exists",
        code: 409,
    },
    userCreated: {
        message: "User created",
        code: 201,
    },
    userDeleted: {
        message: "User deleted",
        code: 200,
    },
    userUpdated: {
        message: "User updated",
        code: 200,
    },
    userLoggedIn: {
        message: "User logged in",
        code: 200,
    },
    userLoggedOut: {
        message: "User logged out",
        code: 200,
    },
    userLoggedOutAll: {
        message: "User logged out from all devices",
        code: 200,
    },
    userNotLoggedIn: {
        message: "User not logged in",
        code: 401,
    },
    userNotAuthorized: {
        message: "User not authorized",
        code: 403,
    },
    userNotAuthorizedToAccess: {
        message: "User not authorized to access",
        code: 403,
    },
    userNotAuthorizedToModify: {
        message: "User not authorized to modify",
        code: 403,
    },
    userNotAuthorizedToCreate: {
        message: "User not authorized to create",
        code: 403,
    },
    userNotAuthorizedToDelete: {
        message: "User not authorized to delete",
        code: 403,
    },
}