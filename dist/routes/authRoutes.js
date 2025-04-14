"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.route("/").post(authController_1.createAccount);
router.route("/:id/create-password").patch(authController_1.createPassword);
router.route("/login").post(authController_1.loginAccount);
router.route("/:email/validate-pass").post(authController_1.checkPassword);
router.route("/reset-password").post(authController_1.resetPassword);
router.route("/:id/complete").patch(authController_1.createNewPassword);
router.route("/:id/get-details").get(authController_1.getSingleUserAccount);
exports.default = router;
