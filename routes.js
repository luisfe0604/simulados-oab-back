const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API Simulados funcionando 🚀" });
});

module.exports = router;
