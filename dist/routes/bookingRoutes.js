"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const router = express_1.default.Router();
router.route("/book-flight/:userId/:transactionId").post(bookingController_1.bookFlight);
router.route("/add-to-cart/:userId").post(bookingController_1.addFlightToCart);
router.route("/remove-from-cart/:cartId").delete(bookingController_1.removeFlightFromCart);
exports.default = router;
