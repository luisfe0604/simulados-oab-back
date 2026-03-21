function requireActiveSubscription(req, res, next) {
  const allowed = ["active", "trialing"];

  if (!allowed.includes(req.user.subscription_status)) {
    return res.status(403).json({ error: "Plano inativo" });
  }

  next();
}

module.exports = requireActiveSubscription;
