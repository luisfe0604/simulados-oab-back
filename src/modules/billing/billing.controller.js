const service = require("./billing.service");
const userService = require("../users/users.service");

const webhook = require("../../services/webhook.service");

async function createCheckoutSession(req, res) {
  try {
    const userId = req.userId;

    const user = await userService.findById(userId);

    const session = await service.createCheckoutSession(user);

    res.json({
      url: session.url,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erro ao criar sessão de pagamento",
    });
  }
}

async function stripeWebhook(req, res) {
  const signature = req.headers["stripe-signature"];

  try {
    await webhook.handleWebhook(req.body, signature);

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err.message);

    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

async function cancel(req, res) {
  try {
    const result = await subscriptionService.cancelSubscription(req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === "SUBSCRIPTION_NOT_FOUND") {
      return res.status(404).json({ error: "Assinatura não encontrada" });
    }

    console.error(err);
    res.status(500).json({ error: "Erro ao cancelar assinatura" });
  }
}

async function reactivate(req, res) {
  try {
    const result = await subscriptionService.reactivateSubscription(
      req.user.id,
    );
    res.json(result);
  } catch (err) {
    if (err.message === "SUBSCRIPTION_NOT_FOUND") {
      return res.status(404).json({ error: "Assinatura não encontrada" });
    }

    console.error(err);
    res.status(500).json({ error: "Erro ao reativar assinatura" });
  }
}

async function status(req, res) {
  try {
    const data = await subscriptionService.getSubscriptionStatus(req.user.id);
    res.json(data);
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.error(err);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
}

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  cancel,
  reactivate,
  status,
};
