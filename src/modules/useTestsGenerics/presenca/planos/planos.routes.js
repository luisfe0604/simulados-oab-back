const express = require("express");

const planosController = require("./planos.controller");

const router = express.Router();

router.get(
  "/",
  planosController.listar,
);

module.exports = router;