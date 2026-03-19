const service = require("./billing.service");
const userService = require("../users/users.service");

const webhook = require("../../services/webhook.service");

async function createCheckoutSession(req, res) {

  try {

    const userId = req.userId;

    const user = await userService.findById(userId);

    const session = await service.createCheckoutSession(user);

    res.json({
      url: session.url
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao criar sessão de pagamento"
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

module.exports = {
  createCheckoutSession,
  stripeWebhook
};