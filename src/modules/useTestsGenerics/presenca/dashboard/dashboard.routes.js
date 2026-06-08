const router = require("express").Router();
const dashController = require("./dashboard.controller");
const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/", dashController.obterResumo);

module.exports = router;