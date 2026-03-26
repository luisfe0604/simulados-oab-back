const pool = require("../database/connection");

module.exports = async function (req, res, next) {
  try {
    const result = await pool.query(
      "SELECT is_admin FROM public.users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    if (!user.is_admin) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    next();
  } catch (error) {
    console.error("Erro no middleware de admin:", error);
    return res.status(500).json({ error: "Erro interno" });
  }
};