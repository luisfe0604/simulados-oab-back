const dashService = require("./dashboard.service");

async function obterResumo(req, res) {
  try {
    const mesBanco = `${req.query.mes}-01`
    const data = await dashService.obterResumo(mesBanco);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  obterResumo,
};
