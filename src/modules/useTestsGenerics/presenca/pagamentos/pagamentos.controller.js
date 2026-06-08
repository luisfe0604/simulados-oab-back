const service = require("./pagamentos.service");

exports.listar = async (req, res) => {
  try {
    const data = await service.listar();

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.listarPorMes = async (req, res) => {
  const mesBanco = `${req.params.mes}-01`;

  try {
    await service.fecharMes(mesBanco);

    const data = await service.listarPorMes(mesBanco);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.inadimplentes = async (req, res) => {
  const mesBanco = `${req.params.mes}-01`;
  try {
    const data = await service.inadimplentes(mesBanco);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.registrar = async (req, res) => {
  try {
    const data = await service.registrar(req.body);

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.fecharMes = async (req, res) => {
  try {
    const data = await service.fecharMes(req.body.mes);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

exports.atualizarPagamento = async (req, res) => {
  try {
    const data = await service.atualizarPagamento(req.params.id, req.body);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.excluir = async (req, res) => {
  try {
    await service.excluir(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};
