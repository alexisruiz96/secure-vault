import { Router } from 'express';
import multer from 'multer';

import { deleteFile, downloadFile, uploadFile, getDataSalt } from '../controllers/filesController';

const filesRouter = Router();

const storage = multer.diskStorage({});

let upload = multer({ storage: storage });

filesRouter.post("/upload", upload.single("myFile"), uploadFile);

filesRouter.get("/download", downloadFile);

filesRouter.get("/salt", getDataSalt);

// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);

filesRouter.delete("/delete/:id", deleteFile);

export default filesRouter;
