const db = require("../../db");

async function listar() {
  const { rows } = await db.query(`
    SELECT
      p.id,
      p.data,
      p.presente,
      a.id AS aluno_id,
      a.nome,
      a.turma
    FROM public.presenca p
    INNER JOIN public.alunos a
      ON a.id = p.aluno_id
    ORDER BY p.data DESC
  `);

  return rows;
}

async function listarPorData(data) {
  const { rows } = await db.query(
    `
    SELECT
      p.id,
      p.data,
      p.presente,
      a.id AS aluno_id,
      a.nome,
      a.turma,
      a.inativo
    FROM public.presenca p
    INNER JOIN public.alunos a
      ON a.id = p.aluno_id
    WHERE p.data = $1
    ORDER BY a.nome
    `,
    [data],
  );

  return rows;
}

async function listarPorAluno(alunoId) {
  const { rows } = await db.query(
    `
    SELECT
      *
    FROM public.presenca
    WHERE aluno_id = $1
    ORDER BY data DESC
    `,
    [alunoId],
  );

  return rows;
}

async function registrar({ aluno_id, data, presente }) {
  const existente = await db.query(
    `
    SELECT id
    FROM public.presenca
    WHERE aluno_id = $1
      AND data = $2
    `,
    [aluno_id, data],
  );

  if (existente.rows.length) {
    const { rows } = await db.query(
      `
      UPDATE public.presenca
      SET presente = $1
      WHERE aluno_id = $2
        AND data = $3
      RETURNING *
      `,
      [presente, aluno_id, data],
    );

    return rows[0];
  }

  const { rows } = await db.query(
    `
    INSERT INTO public.presenca (
      aluno_id,
      data,
      presente
    )
    VALUES (
      $1,
      $2,
      $3
    )
    RETURNING *
    `,
    [aluno_id, data, presente],
  );

  return rows[0];
}

async function registrarLote({ data, presencas }) {
  for (const item of presencas) {
    await registrar({
      aluno_id: item.aluno_id,
      data,
      presente: item.presente,
    });
  }

  return {
    success: true,
  };
}

async function excluir(id) {
  await db.query(
    `
    DELETE FROM public.presenca
    WHERE id = $1
    `,
    [id],
  );
}

module.exports = {
  listar,
  listarPorData,
  listarPorAluno,
  registrar,
  registrarLote,
  excluir,
};
