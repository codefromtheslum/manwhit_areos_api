import express from "express";
import { searchFlightLocation, searchFlights } from "../controllers/flightController";

const router = express.Router();
router.route("/search").get(searchFlights) // Working
router.route("/search-city").get(searchFlightLocation) // Working

export default router;

