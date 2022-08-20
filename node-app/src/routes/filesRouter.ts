import { Router } from "express";

import {
  deleteFile,
  downloadFile,
  uploadFile,
} from "../controllers/filesController";

const filesRouter = Router();

filesRouter.post("/upload", uploadFile);

filesRouter.get("/download", downloadFile);

// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);

filesRouter.delete("/delete/:id", deleteFile);

export default filesRouter;
