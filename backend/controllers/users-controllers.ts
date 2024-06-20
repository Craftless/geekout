import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { HydratedDocument } from "mongoose";
import User, { IUser } from "../models/user";
import { HttpError } from "../util/http-error";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { username, password } = req.body;

  let existingUser: HydratedDocument<IUser> | null;
  try {
    existingUser = await User.findOne({ username });
  } catch (err) {
    return next(
      new HttpError("Finding existing user failed, try again later.", 500)
    );
  }
  if (existingUser)
    return next(new HttpError("User already exists, log in instead", 404));

  let hashedPassword: string;
  try {
    hashedPassword = await hash(password, 12);
  } catch (err) {
    return next(
      new HttpError("Could not create user, please try again later.", 500)
    );
  }

  const createdUser: HydratedDocument<IUser> = new User({
    username,
    password: hashedPassword,
    quizzes: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Signing up failed, try again later.", 500));
  }

  const token = generateJWTToken(createdUser, next);

  res
    .status(201)
    .json({ id: createdUser.id, username: createdUser.username, token });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs", 422));
  }

  const { username, password } = req.body;

  let existingUser: HydratedDocument<IUser> | null;
  try {
    existingUser = await User.findOne({ username });
  } catch (err) {
    return next(new HttpError("Logging in failed, try again later.", 500));
  }
  if (!existingUser)
    return next(new HttpError("User does not exists, sign up instead", 401));

  let validPassword;
  try {
    validPassword = await compare(password, existingUser.password);
  } catch (err) {
    return next(new HttpError("Invalid credentials", 500));
  }

  if (!validPassword) {
    return next(new HttpError("Invalid credentials", 401));
  }
  const token = generateJWTToken(existingUser, next);

  res
    .status(200)
    .json({ id: existingUser.id, username: existingUser.username, token });
};

function generateJWTToken(user: HydratedDocument<IUser>, next: NextFunction) {
  try {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "3h" }
    );
  } catch (err) {
    return next(
      new HttpError("Generating token failed, try again later.", 500)
    );
  }
}
