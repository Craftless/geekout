import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../util/http-error";

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Expecting 'Authorization: "Bearer TOKEN"'
    if (!token) {
      throw new Error(
        "Authorization failed. Please log in again. This might be because your token automatically expired."
      );
    }
    const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    req.userData = { userId: decodedToken.id };
    if (!req.userData?.userId) {
      throw new Error();
    }
    next();
  } catch (err) {
    return next(
      new HttpError(
        "Authorization failed. Please log in again. This might be because your token automatically expired.",
        401
      )
    );
  }
};
