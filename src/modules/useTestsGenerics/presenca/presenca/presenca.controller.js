const service = require("./presenca.service");

async function listar(req, res) {
  try {
    const data = await service.listar(req.query);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function listarPorData(req, res) {
  try {
    const data = await service.listarPorData(req.params.data);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function listarPorAluno(req, res) {
  try {
    const data = await service.listarPorAluno(req.params.alunoId);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function registrar(req, res) {
  try {
    const data = await service.registrar(req.body);

    res.status(201).json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function registrarLote(req, res) {
  try {
    const data = await service.registrarLote(req.body);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function excluir(req, res) {
  try {
    await service.excluir(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  listar,
  listarPorData,
  listarPorAluno,
  registrar,
  registrarLote,
  excluir,
};
