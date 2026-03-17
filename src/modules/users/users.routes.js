const express = require("express");
const controller = require("./users.controller");
const passport = require("passport");
const authMiddleware = require("../../middlewares/auth.middleware");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authMiddleware, controller.me);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {

    const token = jwt.sign(
      { id: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-success?token=${token}`
    );
  }
);
module.exports = router;