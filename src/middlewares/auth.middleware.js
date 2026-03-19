const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  console.log(req.headers)
  const authHeader = req.headers.authorization;

  console.log(authHeader)

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId || decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = authMiddleware;
