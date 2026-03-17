const { Router } = require("express");
const controller = require("./simulatedExams.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = Router();

router.post("/", authMiddleware, controller.finish);

router.get("/", authMiddleware, controller.list);

router.get("/:id", authMiddleware, controller.getById);

router.get("/questions/generate-wrong", authMiddleware, controller.generateWrong)

router.get("/questions/oab", authMiddleware, controller.getOABSimulado);

module.exports = router;