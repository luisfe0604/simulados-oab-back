const stripe = require("../../config/stripe");
const pool = require("../../database/connection");

async function createCheckoutSession(user) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer_email: user.email,

    metadata: {
      userId: user.id,
    },

    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],

    subscription_data: {
      trial_period_days: 7,
    },

    success_url: "https://simulados-oab-back.onrender.com/painel",
    cancel_url: "https://simulados-oab-back.onrender.com/assinar",
  });

  return session;
}

async function cancelSubscription(userId) {
  const result = await pool.query(
    "SELECT gateway_subscription_id FROM users WHERE id = $1",
    [userId],
  );

  const user = result.rows[0];

  if (!user || !user.gateway_subscription_id) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  await stripe.subscriptions.update(user.gateway_subscription_id, {
    cancel_at_period_end: true,
  });

  return { message: "Assinatura será cancelada ao final do período" };
}

async function reactivateSubscription(userId) {
  const result = await pool.query(
    "SELECT gateway_subscription_id FROM users WHERE id = $1",
    [userId],
  );

  const user = result.rows[0];

  if (!user || !user.gateway_subscription_id) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  await stripe.subscriptions.update(user.gateway_subscription_id, {
    cancel_at_period_end: false,
  });

  return { message: "Assinatura reativada com sucesso" };
}

async function getSubscriptionStatus(userId) {
  const result = await pool.query(
    `SELECT 
       subscription_status,
       cancel_at_period_end,
       subscription_cancelled_at,
       plan
     FROM users
     WHERE id = $1`,
    [userId],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
}

module.exports = {
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
  getSubscriptionStatus,
};
