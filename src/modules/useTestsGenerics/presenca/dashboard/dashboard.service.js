const db = require("../../db");

async function obterResumo(mes) {
  const { rows } = await db.query(
    `
    SELECT
      COUNT(*) FILTER (
        WHERE a.inativo = false
      ) AS alunos_ativos,

      COALESCE(
        SUM(pl.valor_total),
        0
      ) AS receita_prevista,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true THEN pl.valor_total
            ELSE 0
          END
        ),
        0
      ) AS receita_recebida,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true THEN pl.valor_quadra
            ELSE 0
          END
        ),
        0
      ) AS custo_quadra,

      COALESCE(
        SUM(pl.valor_quadra),
        0
      ) AS custo_quadra_estimado,

      COALESCE(
        SUM(
          CASE
            WHEN p.pago = true THEN (pl.valor_total - pl.valor_quadra)
            ELSE 0
          END
        ),
        0
      ) AS receita_liquida,

      COALESCE(
        SUM(
          CASE
            WHEN COALESCE(p.pago, false) = false THEN pl.valor_total
            ELSE 0
          END
        ),
        0
      ) AS valor_a_receber,

      COUNT(*) FILTER (
        WHERE COALESCE(p.pago, false) = false
          AND a.inativo = false
      ) AS inadimplentes

    FROM public.alunos a

    INNER JOIN public.planos pl
      ON pl.id = a.plano_id

    LEFT JOIN public.pagamentos p
      ON p.aluno_id = a.id
      AND p.mes = $1
    WHERE inativo = false
    `,
    [mes],
  );

  return rows[0];
}

module.exports = {
  obterResumo,
};