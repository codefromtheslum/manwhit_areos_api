import { Application, json, Request, Response } from "express";
import cors from "cors";
import flightRoutes from "./routes/flightRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import morgan from "morgan";
import session from "express-session";
import "./controllers/passport";
import googleRoutes from "./routes/googleRoutes";
import account from "./routes/authRoutes";
import passport from "passport";
import env from "dotenv";
env.config();

export const mainApp = (app: Application) => {
  app.use(json());
  app.use(
    cors({
      // origin: "https://manwhitareos.web.app",
      origin: ["http://localhost:5173", "https://manwhitareos.web.app"],
      methods: ["GET", "POST", "DELETE", "PATCH"],
      credentials: true,
    })
  );

  app.get("/", (req: Request, res: Response) => {
    res.send(`<a href="#" target="_blank">Successfully gotten</a>`);
  });
  app.use(
    session({
      secret: process.env.JWT!,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/account", account);
  app.use("/auth", googleRoutes);
  app.use("/flight", flightRoutes);
  app.use("/booking", bookingRoutes);
  app.use(morgan("dev"));
};
