import { Router } from 'express';
import multer from 'multer';
import passport from 'passport';

import { deleteFile, downloadFile, subscribeStorage, getDataSalt, uploadFile, checkUploadTime } from '../controllers/filesController';

const filesRouter = Router();

const storage = multer.diskStorage({});

let upload = multer({ storage: storage });

filesRouter.post(
    "/upload",
    passport.authorize("jwt", { session: false }),
    upload.single("myFile"),
    uploadFile
);

filesRouter.get(
    "/storage",
    passport.authorize("jwt", { session: false }),
    downloadFile
);

filesRouter.get(
    "/storageSubscription",
    passport.authorize("jwt", { session: false }),
    subscribeStorage
);

filesRouter.get(
    "/salt",
    passport.authorize("jwt", { session: false }),
    getDataSalt
);

filesRouter.get(
    "/checkuploadtime",
    passport.authorize("jwt", { session: false }),
    checkUploadTime
);

// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);

filesRouter.delete("/delete/:id", deleteFile);

export default filesRouter;
