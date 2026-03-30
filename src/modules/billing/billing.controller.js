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
    const result = await service.cancelSubscription(req.userId);
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
    const result = await service.reactivateSubscription(
      req.userId,
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
    const data = await service.getSubscriptionStatus(req.userId);
    res.json(data);
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    console.error(err);
    res.status(500).json({ error: "Erro ao buscar status" });
  }
}

async function syncSubscription(req, res) {
  try {
    const { subscription_id } = req.body;

    if (!subscription_id) {
      return res.status(400).json({
        error: "subscription_id é obrigatório",
      });
    }

    const subscription = await stripe.subscriptions.retrieve(
      subscription_id
    );

    if (!subscription) {
      return res.status(404).json({
        error: "Subscription não encontrada no Stripe",
      });
    }

    const status = subscription.status;
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;

    const canceledAt = subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : null;

    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    const customerId = subscription.customer;

    const result = await pool.query(
      `UPDATE public.users
       SET 
         subscription_status = $1,
         cancel_at_period_end = $2,
         subscription_cancelled_at = $3,
         trial_end = $4
       WHERE gateway_subscription_id = $5
       RETURNING id`,
      [
        status,
        cancelAtPeriodEnd,
        canceledAt,
        trialEnd,
        subscription_id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado com esse subscription_id",
      });
    }

    return res.json({
      success: true,
      message: "Subscription sincronizada com sucesso",
      data: {
        status,
        trialEnd,
        cancelAtPeriodEnd,
      },
    });
  } catch (err) {
    console.error("Erro ao sincronizar:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  createCheckoutSession,
  stripeWebhook,
  cancel,
  reactivate,
  status,
  syncSubscription
};
