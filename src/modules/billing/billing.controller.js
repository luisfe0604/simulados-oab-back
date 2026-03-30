const stripe = require("../../config/stripe");
const service = require("./billing.service");
const pool = require("../../database/connection");
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

async function syncCustomerSubscription(req, res) {
  try {
    const { customer_id } = req.body;

    if (!customer_id) {
      return res.status(400).json({
        error: "customer_id é obrigatório",
      });
    }

    // 🔥 1. Buscar todas subscriptions do cliente
    const subs = await stripe.subscriptions.list({
      customer: customer_id,
      status: "all",
      limit: 100,
    });

    if (!subs.data.length) {
      // sem subscription → usuário não tem plano
      await pool.query(
        `UPDATE public.users
         SET 
           subscription_status = 'canceled',
           gateway_subscription_id = NULL
         WHERE gateway_customer_id = $1`,
        [customer_id]
      );

      return res.json({
        success: true,
        message: "Cliente sem subscriptions",
      });
    }

    // 🔥 2. Ordenar da mais recente
    const sorted = subs.data.sort((a, b) => b.created - a.created);

    // 🔥 3. Escolher a melhor subscription
    const priorityOrder = ["active", "trialing", "past_due", "incomplete"];

    let selectedSub = null;

    for (const status of priorityOrder) {
      selectedSub = sorted.find((s) => s.status === status);
      if (selectedSub) break;
    }

    // fallback
    if (!selectedSub) {
      selectedSub = sorted[0];
    }

    // 🔥 4. Tratar status problemático
    let finalStatus = selectedSub.status;

    if (finalStatus === "incomplete_expired") {
      finalStatus = "canceled";
    }

    const cancelAtPeriodEnd = selectedSub.cancel_at_period_end;

    const canceledAt = selectedSub.canceled_at
      ? new Date(selectedSub.canceled_at * 1000)
      : null;

    const trialEnd = selectedSub.trial_end
      ? new Date(selectedSub.trial_end * 1000)
      : null;

    // 🔥 5. Atualizar banco
    const result = await pool.query(
      `UPDATE public.users
       SET 
         subscription_status = $1,
         gateway_subscription_id = $2,
         cancel_at_period_end = $3,
         subscription_cancelled_at = $4,
         trial_end = $5
       WHERE gateway_customer_id = $6
       RETURNING id`,
      [
        finalStatus,
        selectedSub.id,
        cancelAtPeriodEnd,
        canceledAt,
        trialEnd,
        customer_id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Usuário não encontrado com esse customer_id",
      });
    }

    // 🔥 DEBUG útil
    console.log("SYNC CUSTOMER:", {
      customer_id,
      selected_subscription: selectedSub.id,
      status: finalStatus,
    });

    return res.json({
      success: true,
      message: "Customer sincronizado com sucesso",
      data: {
        subscription_id: selectedSub.id,
        status: finalStatus,
        trial_end: trialEnd,
      },
    });
  } catch (err) {
    console.error("Erro ao sincronizar customer:", err);

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
  syncCustomerSubscription
};
