const router = require("express").Router();
const alunosController = require("./alunos.controller");
const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/", alunosController.listar);
router.get("/:id", alunosController.obterPorId);

router.post("/", alunosController.criar);

router.put("/:id", alunosController.atualizar);

router.patch("/:id/inativar", alunosController.inativar);
router.patch("/:id/reativar", alunosController.reativar);

router.delete("/:id", alunosController.excluir);

module.exports = router;