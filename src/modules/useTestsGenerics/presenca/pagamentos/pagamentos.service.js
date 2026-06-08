const db = require("../../db");

async function listar() {
  const { rows } = await db.query(`
    SELECT
      pg.id,
      pg.mes,
      pg.pago,

      a.id AS aluno_id,
      a.nome,
      a.turma,
      a.inativo,

      pl.id AS plano_id,
      pl.nome AS plano,
      pl.valor_total,
      pl.valor_quadra,
      (pl.valor_total - pl.valor_quadra) AS valor_liquido

    FROM public.alunos a

    INNER JOIN public.planos pl
      ON pl.id = a.plano_id

    LEFT JOIN public.pagamentos pg
      ON pg.aluno_id = a.id

    ORDER BY pg.mes DESC NULLS LAST, a.nome
  `);

  return rows;
}

async function listarPorMes(mes) {
  const { rows } = await db.query(
    `
    SELECT
      pg.id,
      pg.mes,
      pg.pago,

      a.id AS aluno_id,
      a.nome,
      a.turma,
      a.inativo,

      pl.id AS plano_id,
      pl.nome AS plano,
      pl.valor_total,
      pl.valor_quadra,
      (pl.valor_total - pl.valor_quadra) AS valor_liquido

    FROM public.pagamentos pg

    INNER JOIN public.alunos a
      ON a.id = pg.aluno_id

    INNER JOIN public.planos pl
      ON pl.id = a.plano_id

    WHERE pg.mes = $1

    ORDER BY a.nome
    `,
    [mes],
  );

  return rows;
}

async function inadimplentes(mes) {
  const { rows } = await db.query(
    `
    SELECT
      pg.id,
      pg.mes,

      a.id AS aluno_id,
      a.nome,
      a.turma,

      pl.id AS plano_id,
      pl.nome AS plano,
      pl.valor_total,
      pl.valor_quadra,
      (pl.valor_total - pl.valor_quadra) AS valor_liquido

    FROM public.pagamentos pg

    INNER JOIN public.alunos a
      ON a.id = pg.aluno_id

    INNER JOIN public.planos pl
      ON pl.id = a.plano_id

    WHERE pg.mes = $1
      AND pg.pago = false
      AND pl.valor_total > 0

    ORDER BY a.nome
    `,
    [mes],
  );

  return rows;
}

async function registrar({ aluno_id, mes, pago }) {
  const { rows } = await db.query(
    `
    INSERT INTO public.pagamentos (
      aluno_id,
      mes,
      pago
    )
    VALUES (
      $1,
      $2,
      $3
    )
    RETURNING *
    `,
    [aluno_id, mes, pago],
  );

  return rows[0];
}

async function fecharMes(mes) {
  const { rowCount } = await db.query(
    `
    INSERT INTO public.pagamentos (
      aluno_id,
      mes,
      pago,
      valor_cobrado,
      valor_quadra
    )
    SELECT
      a.id,
      $1,
      false,
      pl.valor_total,
      pl.valor_quadra

    FROM public.alunos a

    INNER JOIN public.planos pl
      ON pl.id = a.plano_id

    WHERE a.inativo = false
      AND pl.valor_total > 0

    ON CONFLICT (aluno_id, mes)
    DO NOTHING
    `,
    [mes],
  );

  return {
    success: true,
    registrosCriados: rowCount,
    mes,
  };
}

async function atualizarPagamento(id, { pago }) {
  const { rows } = await db.query(
    `
    UPDATE public.pagamentos
    SET pago = $1
    WHERE id = $2
    RETURNING *
    `,
    [pago, id],
  );

  return rows[0];
}

async function excluir(id) {
  await db.query(
    `
    DELETE FROM public.pagamentos
    WHERE id = $1
    `,
    [id],
  );
}

module.exports = {
  listar,
  listarPorMes,
  inadimplentes,
  registrar,
  fecharMes,
  atualizarPagamento,
  excluir,
};
