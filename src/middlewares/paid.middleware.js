const pool = require("../database/connection");

async function requireActiveSubscription(req, res, next) {
  try {
    const userId = req.user?.userId;
    console.log(req.user)

    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const result = await pool.query(
      "SELECT subscription_status, is_admin FROM public.users WHERE id = $1",
      [userId],
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    if (user.is_admin) {
      return next();
    }

    const allowed = ["active", "trialing"];

    if (!allowed.includes(user.subscription_status)) {
      return res.status(403).json({ error: "Plano inativo" });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno" });
  }
}

module.exports = requireActiveSubscription;
