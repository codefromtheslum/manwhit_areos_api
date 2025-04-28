import express from "express";
import { searchFlights } from "../controllers/flightController";
import { verifyFlightPrice } from "../controllers/bookingController";

const router = express.Router();
router.route("/search").get(searchFlights); // Working
router.route("/verify-flight").post(verifyFlightPrice);

export default router;
