const service = require("./questions.service");

async function create(req, res) {
  try {
    const {
      statement,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_option,
      difficulty,
      exam_id,
      subjects
    } = req.body;

    if (!statement || !option_a || !option_b || !option_c || !correct_option) {
      return res.status(400).json({ error: "Campos obrigatórios faltando" });
    }

    const question = await service.create({
      statement,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_option,
      difficulty,
      exam_id,
      subjects
    });

    return res.status(201).json(question);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function generate(req, res) {
  try {
    const { subject_id, limit } = req.query;

    const questions = await service.generate({
      subject_id,
      limit
    });

    return res.json(questions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { create, generate };