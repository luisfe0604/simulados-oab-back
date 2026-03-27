const express = require("express");
const controller = require("./users.controller");
const passport = require("passport");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authMiddleware, controller.me);
router.get("/metrics", authMiddleware, adminMiddleware, controller.getMetrics);

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
