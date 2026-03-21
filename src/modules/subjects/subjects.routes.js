const { Router } = require("express");
const controller = require("./subjects.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const paidMiddleware = require("../../middlewares/paid.middleware");

const router = Router();

router.get("/", authMiddleware, paidMiddleware, controller.getSubjects);

module.exports = router;