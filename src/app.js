const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const billing = require("./modules/billing/billing.routes");
const billingController = require("./modules/billing/billing.controller");
const passport = require("./config/passport");

const app = express();

app.use(cors());

app.post(
  "/billing/webhook",
  express.raw({ type: "application/json" }),
  billingController.stripeWebhook,
);

app.use(express.json());

app.use(passport.initialize());
app.use("/billing", billing);
app.use(routes);

module.exports = app;
