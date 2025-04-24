import express from "express";
import { searchFlights } from "../controllers/flightController";

const router = express.Router();
router.route("/search").get(searchFlights); // Working

export default router;
