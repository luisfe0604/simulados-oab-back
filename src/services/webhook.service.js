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
        `UPDATE public.users 
     SET 
       subscription_status = 'trial',
       plan = 'premium',
       trial_end = $2,
       subscription_started_at = NOW(),
       gateway_customer_id = $3,
       gateway_subscription_id = $4
     WHERE id = $1`,
        [
          userId,
          trialEnd,
          session.customer,
          session.subscription,
        ],
      );

      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await pool.query(
        `UPDATE public.users 
     SET 
       subscription_status = 'active'
     WHERE gateway_customer_id = $1`,
        [customerId],
      );

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;

      await pool.query(
        `UPDATE public.users 
     SET 
       subscription_status = $1,
       cancel_at_period_end = $2,
       subscription_cancelled_at = to_timestamp($3)
     WHERE gateway_subscription_id = $4`,
        [
          subscription.status,
          subscription.cancel_at_period_end,
          subscription.subscription_cancelled_at,
          subscription.id,
        ],
      );

      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      await pool.query(
        `UPDATE public.users 
     SET subscription_status = 'past_due'
     WHERE gateway_customer_id = $1`,
        [customerId],
      );

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;

      await pool.query(
        `UPDATE public.users 
          SET 
            subscription_status = 'canceled',
            cancel_at_period_end = false
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
