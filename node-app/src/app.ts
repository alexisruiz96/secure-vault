import { json } from 'body-parser';
// Enables CORS for all requests
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { i18n } from './i18n/i18n';
import filesRouter from './routes/filesRouter';
import usersRouter from './routes/usersRouter';
import { PORT } from './utils/config';
import { initializePassportConfig } from './utils/passport-config';

const app = express();

//TODO: Add the correct origin
app.use(cors());

app.use(json());

passport.initialize();

initializePassportConfig(passport);

app.use("/users", usersRouter);
app.use("/files", filesRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ message: err.message });
});

app.listen(parseInt(PORT), () => {
    console.log(i18n.serverStart, parseInt(PORT));
});
