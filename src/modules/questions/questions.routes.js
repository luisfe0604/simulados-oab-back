const { Router } = require("express");
const controller = require("./questions.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, controller.create);

router.get("/generate", authMiddleware, controller.generate);

module.exports = router;