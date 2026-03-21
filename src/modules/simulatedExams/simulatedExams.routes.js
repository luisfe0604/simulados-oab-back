const { Router } = require("express");
const controller = require("./simulatedExams.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const paidMiddleware = require("../../middlewares/paid.middleware");

const router = Router();

router.post("/", authMiddleware, paidMiddleware, controller.finish);

router.get("/", authMiddleware, paidMiddleware, controller.list);

router.get("/:id", authMiddleware, paidMiddleware, controller.getById);

router.get("/questions/generate-wrong", authMiddleware, paidMiddleware, controller.generateWrong)

router.get("/questions/oab", authMiddleware, paidMiddleware, controller.getOABSimulado);

module.exports = router;