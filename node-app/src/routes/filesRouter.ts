import {Router} from 'express';

import{ uploadFile, downloadFile, deleteFile } from '../controllers/filesController'

const filesRouter = Router();

filesRouter.post('/',uploadFile);

filesRouter.get('/',downloadFile);

// discuss if this is necessary
// filesRouter.patch('/:id', updateFile);

filesRouter.delete('/:id', deleteFile);

export default filesRouter;