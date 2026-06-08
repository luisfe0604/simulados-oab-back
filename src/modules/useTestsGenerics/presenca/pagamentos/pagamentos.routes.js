const router = require("express").Router();

const controller = require("./pagamentos.controller");

const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/", controller.listar);

router.get("/mes/:mes", controller.listarPorMes);

router.get("/inadimplentes/:mes", controller.inadimplentes);

router.post("/", controller.registrar);

router.post("/fechar-mes", controller.fecharMes);

router.patch("/:id", controller.atualizarPagamento);

router.delete("/:id", controller.excluir);

module.exports = router;