const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = express.Router();

const controller = require("./billing.controller");

router.post(
  "/create-checkout-session",
  authMiddleware, 
  controller.createCheckoutSession
);

router.post(
  "/webhook",
  controller.stripeWebhook
);

router.get(
  "/subscription",
  authMiddleware,
  controller.status
);

router.post(
  "/subscription/cancel",
  authMiddleware,
  controller.cancel
);

router.post(
  "/subscription/reactivate",
  authMiddleware,
  controller.reactivate
);

module.exports = router;