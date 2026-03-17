const stripe = require("../config/stripe");
const pool = require("../database/connection");

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
        `UPDATE users 
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
        `UPDATE users 
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
        `UPDATE users 
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
  handleWebhook,
};