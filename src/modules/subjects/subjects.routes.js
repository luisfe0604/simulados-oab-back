const { Router } = require("express");
const controller = require("./subjects.controller");
const authMiddleware = require("../../middlewares/auth.middleware");

const router = Router();

router.get("/", authMiddleware, controller.getSubjects);

module.exports = router;