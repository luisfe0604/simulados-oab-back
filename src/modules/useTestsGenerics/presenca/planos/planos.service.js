const db = require("../../db");

async function listar() {
  const { rows } = await db.query(`
    SELECT
      id,
      nome,
      valor_total,
      valor_quadra
    FROM public.planos
    ORDER BY valor_total DESC
  `);

  return rows;
}

module.exports = {
  listar,
};