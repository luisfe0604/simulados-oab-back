const service = require("./exams.service");

async function findAll(req, res) {
  try {
    const exams = await service.findAll();

    return res.json(exams);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { findAll };