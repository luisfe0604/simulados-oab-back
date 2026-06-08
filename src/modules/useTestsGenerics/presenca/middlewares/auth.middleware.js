const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ngfuquqknytsohukhqvb.supabase.co",
  "sb_publishable_snJn6imNMNwWX2C-__KqMw_lyYwJYRc",
);

module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        error: "Token não informado",
      });
    }

    const token = authorization.replace("Bearer ", "");

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({
        error: "Token inválido",
      });
    }

    req.user = data.user;

    next();
  } catch (err) {
    console.error(err);

    return res.status(401).json({
      error: "Não autorizado",
    });
  }
};
