const router = require("express").Router();

const controller = require("./presenca.controller");

const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/", controller.listar);

router.get("/data/:data", controller.listarPorData);

router.get("/aluno/:alunoId", controller.listarPorAluno);

router.post("/", controller.registrar);

router.post("/lote", controller.registrarLote);

router.delete("/:id", controller.excluir);

module.exports = router;