const stripe = require("../../config/stripe");
const pool = require("../../database/connection");

async function createCheckoutSession(user) {

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer_email: user.email,

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
  console.log(session)

  return session;

}

async function handleWebhook(body, signature) {

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {

    case "checkout.session.completed": {

      const session = event.data.object;
      const email = session.customer_email;

      await pool.query(
        `UPDATE public.users 
         SET subscription_status = 'active',
             plan = 'premium',
             subscription_started_at = NOW()
         WHERE email = $1`,
        [email]
      );

      break;
    }

    case "invoice.payment_failed": {

      const invoice = event.data.object;
      const email = invoice.customer_email;

      await pool.query(
        `UPDATE public.users 
         SET subscription_status = 'past_due'
         WHERE email = $1`,
        [email]
      );

      break;
    }

    case "customer.subscription.deleted": {

      const subscription = event.data.object;
      const customerId = subscription.customer;

      await pool.query(
        `UPDATE public.users 
         SET subscription_status = 'canceled',
             subscription_cancelled_at = NOW()
         WHERE gateway_customer_id = $1`,
        [customerId]
      );

      break;
    }

  }

}

module.exports = {
  createCheckoutSession,
  handleWebhook
};