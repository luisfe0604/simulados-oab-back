const db = require('../db');

const {
  broadcastMesasAtualizadas
} = require('../websocket/websocket');

async function listarMesas() {
  const result = await db.query(
    'SELECT * FROM public.mesas_festa ORDER BY id'
  );

  return result.rows;
}

async function reservarMesa({
  id,
  nome,
  cadeiras
}) {
  const result = await db.query(
    `
      UPDATE public.mesas_festa
      SET
        nome = $1,
        cadeiras = $2,
        ocupada = true
      WHERE id = $3
      AND ocupada = false
      RETURNING *
    `,
    [nome, cadeiras, id]
  );

  if (result.rowCount > 0) {
    broadcastMesasAtualizadas();
  }

  return result.rows[0];
}

async function atualizarMesa({
  id,
  nome,
  cadeiras
}) {
  const result = await db.query(
    `
      UPDATE public.mesas_festa
      SET
        nome = $1,
        cadeiras = $2,
        ocupada = true
      WHERE id = $3
      RETURNING *
    `,
    [nome, cadeiras, id]
  );

  if (result.rowCount > 0) {
    broadcastMesasAtualizadas();
  }

  return result.rows[0];
}

async function limparMesa({
  id,
  nome,
  cadeiras,
  ocupada
}) {
  const result = await db.query(
    `
      UPDATE public.mesas_festa
      SET
        nome = $1,
        cadeiras = $2,
        ocupada = $3
      WHERE id = $4
      RETURNING *
    `,
    [nome, cadeiras, ocupada, id]
  );

  if (result.rowCount > 0) {
    broadcastMesasAtualizadas();
  }

  return result.rows[0];
}

module.exports = {
  listarMesas,
  reservarMesa,
  atualizarMesa,
  limparMesa
};