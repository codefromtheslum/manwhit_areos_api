import express from "express";
import {
  createAccount,
  createPassword,
  loginAccount,
} from "../controllers/authController";

const router = express.Router();
router.route("/").post(createAccount);
router.route("/:id/create-password").patch(createPassword);
router.route("/login").post(loginAccount);

export default router;
