import express from "express";
import passport from "passport";


const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: true }),
  (req, res) => {
    res.redirect("/profile");
  }
);

router.get("/logout", (req, res) => {
  req.logOut(() => {
    res.redirect("/");
  });
});


export default router