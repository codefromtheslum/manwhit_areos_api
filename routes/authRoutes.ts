import express from "express";
import { deleteAccount, getAccountDetails, getAllAccountDetails, loginAccount, registerAccount, requestResetPassword, setPassword, updateAccount, verifyAccount } from "../controllers/authController";
import multer from "multer";

const upload = multer().single("avatarUrl")

const router = express.Router();
router.route("/").post(registerAccount); // Working
router.route("/:userId/verify-account").patch(verifyAccount); // Working
router.route("/login").post(loginAccount); // Working
router.route("/:userId/get-details").get(getAccountDetails); // Working
router.route("/details").get(getAllAccountDetails); // Working
router.route("/:userId/update-detail").patch(upload, updateAccount); // Working
router.route("/request-reset").post(requestResetPassword); // Working
router.route("/:userId/set").patch(setPassword); // Working
router.route("/:userId/delete-account").delete(deleteAccount) // Working


export default router