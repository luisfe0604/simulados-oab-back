const planosService = require("./planos.service");

async function listar(req, res) {
  try {
    const data =
      await planosService.listar();

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  listar,
};