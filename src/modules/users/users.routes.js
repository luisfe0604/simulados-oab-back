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

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      console.log(token)

      // 🔴 se já for premium, não manda pro checkout
      const hasActiveAccess =
        user.subscription_status === "active" ||
        (user.subscription_status === "trial" &&
          user.trial_end &&
          new Date(user.trial_end) > new Date());

      // 🔴 se já tem acesso, não manda pro Stripe
      if (hasActiveAccess) {
        return res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
      }

      // 💳 cria checkout
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID, // 🔥 seu price_id
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
        success_url: `${process.env.FRONTEND_URL}/sucesso?token=${token}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancelado`,
      });

      // 🚀 redireciona direto pro Stripe
      return res.redirect(session.url);
    } catch (err) {
      console.error(err);
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  },
);

module.exports = router;
