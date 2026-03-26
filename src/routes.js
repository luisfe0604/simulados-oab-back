const express = require("express");
const router = express.Router();

const usersRoutes = require("./modules/users/users.routes");
const questionsRoutes = require("./modules/questions/questions.routes");
const simulatedExamsRoutes = require("./modules/simulatedExams/simulatedExams.routes");
const subjectsRoutes = require("./modules/subjects/subjects.routes");
const billingRoutes = require("./modules/billing/billing.routes");
const examsRoutes = require("./modules/exams/exams.routes");

router.use("/billing", billingRoutes);
router.use("/users", usersRoutes);
router.use("/questions", questionsRoutes);
router.use("/simulados", simulatedExamsRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/exams", examsRoutes);

module.exports = router;
