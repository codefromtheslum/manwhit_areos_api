import express from "express";
import {
  checkPassword,
  createAccount,
  createNewPassword,
  createPassword,
  getSingleUserAccount,
  loginAccount,
  resetPassword,
} from "../controllers/authController";

const router = express.Router();
router.route("/").post(createAccount);
router.route("/:id/create-password").patch(createPassword);
router.route("/login").post(loginAccount);
router.route("/:email/validate-pass").post(checkPassword);
router.route("/reset-password").post(resetPassword);
router.route("/:id/complete").patch(createNewPassword);
router.route("/:id/get-details").get(getSingleUserAccount);

export default router;
