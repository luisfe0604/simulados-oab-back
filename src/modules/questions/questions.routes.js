const { Router } = require("express");
const controller = require("./questions.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const paidMiddleware = require("../../middlewares/paid.middleware");

const router = Router();

router.post("/", authMiddleware, paidMiddleware, controller.create);

router.get("/generate", authMiddleware, paidMiddleware, controller.generate);

module.exports = router;