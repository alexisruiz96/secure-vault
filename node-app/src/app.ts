import { json } from "body-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import filesRouter from "./routes/filesRouter";
import usersRouter from "./routes/usersRouter";

const app = express();

// Enables CORS for all requests
// app.use(cors())

app.use(json());

app.use("/users", usersRouter);
app.use("/files", filesRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(4000, () => {
  console.log("Server started on port ", 4000);
});
