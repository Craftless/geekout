import "dotenv/config";

import express, { NextFunction, Request, Response } from "express";
import mongoSanitise from "express-mongo-sanitize";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import presentationsRoutes from "./routes/presentations-routes";
import usersRoutes from "./routes/users-routes";
import socketMain from "./sockets/sockets";
import { HttpError } from "./util/http-error";

const app = express();

declare module "express-serve-static-core" {
  interface Request {
    userData?: {
      userId: string;
    };
  }
}

app.use(express.json());

const server = http.createServer(app);

const db: string = process.env.MONGO_URI!;

mongoose
  .connect(db)
  .then(() => console.log("💻 Mondodb Connected"))
  .catch((err) => console.error(err));

console.log(process.env.CLIENT_URL);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(
  mongoSanitise({
    onSanitize: ({ req, key }) => {
      console.warn(`This request[${key}] is sanitized`, req);
    },
  })
);

app.use("/api/users", usersRoutes);
app.use("/api/quizzes", presentationsRoutes);

app.use((req, res, next) => {
  next(new HttpError("Could not find this route", 404));
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  res
    .status(err.code || 500)
    .json({ message: err.message || "An error occurred!" });
});

server.listen(process.env.PORT || 9000);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketMain(io);

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  join_room: (room: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}
