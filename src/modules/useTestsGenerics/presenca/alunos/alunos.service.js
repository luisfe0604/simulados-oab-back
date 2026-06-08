const db = require("../../db");

const TURMAS = ["A", "B"];

function validarTurma(turma) {
  if (!TURMAS.includes(turma)) {
    throw new Error("Turma inválida");
  }
}

async function listar({ inativo, turma } = {}) {
  const params = [];
  const where = [];

  if (inativo !== undefined) {
    params.push(inativo === "true");
    where.push(`a.inativo = $${params.length}`);
  }

  if (turma) {
    params.push(turma);
    where.push(`a.turma = $${params.length}`);
  }

  let sql = `
    SELECT
      a.id,
      a.nome,
      a.turma,
      a.inativo,

      p.id AS plano_id,
      p.nome AS plano,
      p.valor_total,
      p.valor_quadra,
      (p.valor_total - p.valor_quadra) AS valor_liquido

    FROM public.alunos a
    INNER JOIN public.planos p
      ON p.id = a.plano_id
  `;

  if (where.length) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  sql += ` ORDER BY a.nome`;

  const { rows } = await db.query(sql, params);

  return rows;
}

async function obterPorId(id) {
  const { rows } = await db.query(
    `
    SELECT
      a.id,
      a.nome,
      a.turma,
      a.inativo,

      p.id AS plano_id,
      p.nome AS plano,
      p.valor_total,
      p.valor_quadra,
      (p.valor_total - p.valor_quadra) AS valor_liquido

    FROM public.alunos a
    INNER JOIN public.planos p
      ON p.id = a.plano_id

    WHERE a.id = $1
    `,
    [id],
  );

  return rows[0];
}

async function criar({ nome, turma, plano_id }) {
  validarTurma(turma);

  const { rows } = await db.query(
    `
    INSERT INTO public.alunos (
      nome,
      turma,
      plano_id,
      inativo
    )
    VALUES (
      $1,
      $2,
      $3,
      false
    )
    RETURNING *
    `,
    [nome, turma, plano_id],
  );

  return rows[0];
}

async function atualizar(id, { nome, turma, inativo, plano_id }) {
  validarTurma(turma);

  const { rows } = await db.query(
    `
    UPDATE public.alunos
    SET
      nome = $1,
      turma = $2,
      inativo = $3,
      plano_id = $4
    WHERE id = $5
    RETURNING *
    `,
    [nome, turma, inativo, plano_id, id],
  );

  return rows[0];
}

async function inativar(id) {
  await db.query(
    `
    UPDATE public.alunos
    SET inativo = true
    WHERE id = $1
    `,
    [id],
  );
}

async function reativar(id) {
  await db.query(
    `
    UPDATE public.alunos
    SET inativo = false
    WHERE id = $1
    `,
    [id],
  );
}

async function excluir(id) {
  await db.query(
    `
    DELETE FROM public.alunos
    WHERE id = $1
    `,
    [id],
  );
}

module.exports = {
  listar,
  obterPorId,
  criar,
  atualizar,
  inativar,
  reativar,
  excluir,
};
