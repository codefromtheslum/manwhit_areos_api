import express from "express";
import { addFlightToCart, bookFlight, removeFlightFromCart } from "../controllers/bookingController";

const router = express.Router();
router.route("/book-flight/:userId/:transactionId").post(bookFlight);
router.route("/add-to-cart/:userId").post(addFlightToCart);
router.route("/remove-from-cart/:cartId").delete(removeFlightFromCart);

export default router;
