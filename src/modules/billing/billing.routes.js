const express = require("express");
const router = express.Router();

const controller = require("./billing.controller");

router.post(
  "/create-checkout-session",
  controller.createCheckoutSession
);

router.post(
  "/webhook",
  controller.stripeWebhook
);

module.exports = router;