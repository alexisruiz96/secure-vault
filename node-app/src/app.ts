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

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

//TODO: Add the correct origin
app.use(cors(corsOptions));

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
