const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const billing = require("./modules/billing/billing.routes");
const billingController = require("./modules/billing/billing.controller");
const passport = require("./config/passport");
const http = require('http'); //api teste
const { initWebSocket } = require('./modules/useTestsGenerics/websocket/websocket');//api teste

const app = express();

app.use(express.static('frontend'));//api teste

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

const server = http.createServer(app);//api teste

initWebSocket(server);//api teste

module.exports = app;
