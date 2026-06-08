const cron = require("node-cron");
const { fecharMes } = require("./pagamentos/pagamentos.service");

cron.schedule(
  "0 0 1 * *",
  async () => {
    const mes = new Date().toISOString().slice(0, 7);

    console.log("[CRON] Gerando mês automaticamente:", mes);

    try {
      await fecharMes(mes);
      console.log("[CRON] Mês gerado com sucesso");
    } catch (err) {
      console.error("[CRON] Erro ao gerar mês:", err);
    }
  },
  {
    timezone: "America/Sao_Paulo",
  }
);