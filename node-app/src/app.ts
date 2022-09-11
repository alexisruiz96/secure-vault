import { json } from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import filesRouter from "./routes/filesRouter";
import usersRouter from "./routes/usersRouter";
import { PORT } from "./utils/config";
import { i18n } from "./i18n/i18n";

const app = express();

// Enables CORS for all requests
import cors from "cors";
app.use(cors())

app.use(json());

//add local passport

app.use("/users", usersRouter);
app.use("/files", filesRouter);



app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(parseInt(PORT), () => {
  console.log(i18n.serverStart, parseInt(PORT));
});
