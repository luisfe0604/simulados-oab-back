const alunosService = require("./alunos.service");

async function listar(req, res) {
  try {
    const data = await alunosService.listar(req.query);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function obterPorId(req, res) {
  try {
    const data = await alunosService.obterPorId(req.params.id);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function criar(req, res) {
  try {
    const data = await alunosService.criar(req.body);

    res.status(201).json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function atualizar(req, res) {
  try {
    const data = await alunosService.atualizar(req.params.id, req.body);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function inativar(req, res) {
  try {
    await alunosService.inativar(req.params.id);

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

async function reativar(req, res) {
  try {
    await alunosService.reativar(req.params.id);

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

async function excluir(req, res) {
  try {
    await alunosService.excluir(req.params.id);

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
  obterPorId,
  criar,
  atualizar,
  inativar,
  reativar,
  excluir,
};
