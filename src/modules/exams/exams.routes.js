const { Router } = require("express");
const controller = require("./exams.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const adminMiddleware = require("../../middlewares/admin.middleware");

const router = Router();

router.get("/", authMiddleware, adminMiddleware, controller.findAll);

module.exports = router;