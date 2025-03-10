import express from "express";
import { bookFlight } from "../controllers/bookingController";

const router = express.Router();
router.route("/book-flight").post(bookFlight);

export default router;