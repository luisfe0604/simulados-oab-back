const mesasService = require('./mesas.service');

async function listarMesas(req, res) {
  try {
    const mesas = await mesasService.listarMesas();

    res.json(mesas);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
}

async function reservarMesa(req, res) {
  try {
    const id = parseInt(req.params.id, 10) + 1;

    const { nome, cadeiras } = req.body;

    if (!nome || !cadeiras) {
      return res.status(400).json({
        error: 'Nome e número de cadeiras são obrigatórios.'
      });
    }

    const mesa = await mesasService.reservarMesa({
      id,
      nome,
      cadeiras
    });

    if (!mesa) {
      return res.status(409).json({
        error: 'Mesa já está ocupada ou não existe.'
      });
    }

    res.status(200).json({
      message: 'Mesa reservada com sucesso.',
      mesa
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
}

async function atualizarMesa(req, res) {
  try {
    const id = parseInt(req.params.id, 10) + 1;

    const { nome, cadeiras } = req.body;

    if (!nome || !cadeiras) {
      return res.status(400).json({
        error: 'Nome e número de cadeiras são obrigatórios.'
      });
    }

    const mesa = await mesasService.atualizarMesa({
      id,
      nome,
      cadeiras
    });

    if (!mesa) {
      return res.status(404).json({
        error: 'Mesa não encontrada.'
      });
    }

    res.status(200).json({
      message: 'Mesa atualizada com sucesso.',
      mesa
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
}

async function limparMesa(req, res) {
  try {
    const id = parseInt(req.params.id, 10) + 1;

    const { nome, cadeiras, ocupada } = req.body;

    if (typeof ocupada !== 'boolean') {
      return res.status(400).json({
        error: 'Valor de "ocupada" inválido.'
      });
    }

    const mesa = await mesasService.limparMesa({
      id,
      nome,
      cadeiras,
      ocupada
    });

    if (!mesa) {
      return res.status(404).json({
        error: 'Mesa não encontrada.'
      });
    }

    res.status(200).json({
      message: 'Mesa atualizada com sucesso.',
      mesa
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
}

module.exports = {
  listarMesas,
  reservarMesa,
  atualizarMesa,
  limparMesa
};