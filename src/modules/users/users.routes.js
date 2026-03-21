const express = require("express");
const controller = require("./users.controller");
const passport = require("passport");
const authMiddleware = require("../../middlewares/auth.middleware");
const Stripe = require("stripe");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authMiddleware, controller.me);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function hasAccess(user) {
  if (user.subscription_status === "active") return true;

  if (
    user.subscription_status === "trial" &&
    user.trial_end &&
    new Date(user.trial_end).getTime() > Date.now()
  ) {
    return true;
  }

  return false;
}

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  controller.googleCallback,
);

module.exports = router;
