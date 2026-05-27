const service = require("./subjects.service");

async function getSubjects(req, res) {
  try {
    const subjects = await service.getSubjects();
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar assuntos" });
  }
}

module.exports = {
  getSubjects,
};