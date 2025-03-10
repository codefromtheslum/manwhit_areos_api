import express, { Response } from "express";
import passport from "../controllers/googleController";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔹 Start Google Authentication
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 🔹 Google Callback Route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req: any, res: Response) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email },
      process.env.JWT! || "default_secret",
      { expiresIn: "1d" }
    );

    // Set token as a cookie
    res.cookie("jwt", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/auth/authenticate?token=${token}`);
  }
);

// 🔹 Logout Route
router.get("/logout", (req: any, res: Response) => {
  req.logout((err: any) => {
    if (err) return res.status(500).json({ message: "Logout failed" });

    res.clearCookie("jwt"); // Clear the JWT cookie
    res.status(200).json({ message: "Logged out successfully" });
  });
});

export default router;
