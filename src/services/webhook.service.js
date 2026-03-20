const stripe = require("../config/stripe");
const pool = require("../database/connection");

async function handleWebhook(body, signature) {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const userId = session.metadata.userId;

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      await pool.query(
        `UPDATE users 
     SET subscription_status = 'trial',
         plan = 'premium',
         trial_end = $2,
         subscription_started_at = NOW(),
         gateway_customer_id = $3
     WHERE id = $1`,
        [userId, trialEnd, session.customer],
      );

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await pool.query(
        `UPDATE users 
     SET subscription_status = 'active'
     WHERE gateway_customer_id = $1`,
        [customerId],
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
        [email],
      );

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      await pool.query(
        `UPDATE users 
     SET subscription_status = 'cancelled'
     WHERE gateway_subscription_id = $1`,
        [subscription.id],
      );

      break;
    }
  }
}

module.exports = {
  handleWebhook,
};
