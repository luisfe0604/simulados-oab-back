const service = require("./simulatedExams.service");

async function finish(req, res) {
  try {
    const { answers, duration_seconds } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "Respostas inválidas" });
    }

    const result = await service.finishSimulado({
      userId: req.userId,
      answers,
      duration_seconds,
    });

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function list(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await service.listSimulados({
      userId: req.userId,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;

    const result = await service.getSimuladoById({
      userId: req.userId,
      simulatedId: id,
    });

    if (!result) {
      return res.status(404).json({ error: "Simulado não encontrado" });
    }

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function generateWrong(req, res) {
  const userId = req.userId;
  const limit = parseInt(req.query.limit) || 20;

  const questions = await service.generateWrongQuestionsSimulado({
    userId,
    limit,
  });

  res.json(questions);
}

async function getOABSimulado(req, res) {
  try {
    const simulado = await service.generateOABSimulado();
    res.json(simulado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { finish, list, getById, generateWrong, getOABSimulado };
