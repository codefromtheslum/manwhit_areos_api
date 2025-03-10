import { Application, json } from "express";
import cors from "cors";
import googleRoutes from "./routes/googleRoutes";
import authRoutes from "./routes/authRoutes";
import passport from "./controllers/googleController";
import flightRoutes from "./routes/flightRoutes"
import bookingRoutes from "./routes/bookingRoutes"
import env from "dotenv";
import morgan from "morgan";
env.config();

export const mainApp = (app: Application) => {
    app.use(json());
    app.use(cors({
        // origin: "http://localhost:3000",
        origin: "*",
        methods: ["GET", "POST", "DELETE", "PATCH"],
        credentials: true
    }))
    app.use("/auth", googleRoutes)
    app.use("/account", authRoutes)
    app.use("/flight", flightRoutes)
    app.use("/booking", bookingRoutes)
    app.use(morgan("dev"))
    app.use(passport.initialize());
    app.use(passport.session())

}
