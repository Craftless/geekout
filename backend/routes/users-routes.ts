import express from "express";
import { check } from "express-validator";
import { login, signup } from "../controllers/users-controllers";

const router = express.Router();

router.post(
  "/signup",
  [check("username").notEmpty().isAlphanumeric(), check("password").notEmpty()],
  signup
);

router.post("/login", login);

export default router;
