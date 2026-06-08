const express = require("express");
const router = express.Router();

const usersRoutes = require("./modules/users/users.routes");
const billingRoutes = require("./modules/billing/billing.routes");

const questionsRoutes = require("./modules/questions/questions.routes");
const simulatedExamsRoutes = require("./modules/simulatedExams/simulatedExams.routes");
const subjectsRoutes = require("./modules/subjects/subjects.routes");
const examsRoutes = require("./modules/exams/exams.routes");

const enemQuestionsRoutes = require("./modules/enem/questions/questions.routes");
const enemSimulatedExamsRoutes = require("./modules/enem/simulatedExams/simulatedExams.routes");
const enemSubjectsRoutes = require("./modules/enem/subjects/subjects.routes");
const enemExamsRoutes = require("./modules/enem/exams/exams.routes");

const testsRoutes = require("./modules/useTestsGenerics/mesas_festa_pingo/mesas.routes");

const testsRoutesPresenca = require("./modules/useTestsGenerics/presenca/presenca/presenca.routes");
const testsRoutesAlunos = require("./modules/useTestsGenerics/presenca/alunos/alunos.routes");
const testsRoutesPagamentos = require("./modules/useTestsGenerics/presenca/pagamentos/pagamentos.routes");
const testsRoutesDashboard = require("./modules/useTestsGenerics/presenca/dashboard/dashboard.routes");
const testsRoutesPlanos = require("./modules/useTestsGenerics/presenca/planos/planos.routes");


router.use("/billing", billingRoutes);
router.use("/users", usersRoutes);

router.use("/questions", questionsRoutes);
router.use("/simulados", simulatedExamsRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/exams", examsRoutes);

router.use("/enem/questions", enemQuestionsRoutes);
router.use("/enem/simulados", enemSimulatedExamsRoutes);
router.use("/enem/subjects", enemSubjectsRoutes);
router.use("/enem/exams", enemExamsRoutes);

router.use("/mesas", testsRoutes);

router.use("/presenca", testsRoutesPresenca);
router.use("/alunos", testsRoutesAlunos);
router.use("/pagamentos", testsRoutesPagamentos);
router.use("/dashboard", testsRoutesDashboard);
router.use("/planos", testsRoutesPlanos);


module.exports = router;
