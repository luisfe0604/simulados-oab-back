const db = require("../../db");

async function obterResumo(mes) {
  const { rows } = await db.query(
    `
    SELECT
      COUNT(*) FILTER (
        WHERE a.inativo = false
      ) AS alunos_ativos,

      COALESCE(
        SUM(p.valor_cobrado),
        0
      ) AS receita_prevista,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true
            THEN p.valor_cobrado
            ELSE 0
          END
        ),
        0
      ) AS receita_recebida,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true
            THEN p.valor_quadra
            ELSE 0
          END
        ),
        0
      ) AS custo_quadra,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true
            THEN p.valor_cobrado - p.valor_quadra
            ELSE 0
          END
        ),
        0
      ) AS receita_liquida,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = false
            THEN p.valor_cobrado
            ELSE 0
          END
        ),
        0
      ) AS valor_a_receber,

      COUNT(*) FILTER (
        WHERE p.pago = false
      ) AS inadimplentes

    FROM public.pagamentos p
    INNER JOIN public.alunos a
      ON a.id = p.aluno_id

    WHERE p.mes = $1
    `,
    [mes],
  );

  return rows[0];
}

module.exports = {
  obterResumo,
};
