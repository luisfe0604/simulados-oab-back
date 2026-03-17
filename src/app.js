const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const billing = require("./modules/billing/billing.routes");
const passport = require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use("/billing/webhook", express.raw({ type: "application/json" }));
app.use("/billing", billing);

app.use(routes);

module.exports = app;
