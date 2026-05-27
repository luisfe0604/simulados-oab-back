const pool = require("../../../database/connection");

async function findAll() {
  const query = `
    SELECT 
      e.*
    FROM exams_enem e;
  `;

  const result = await pool.query(query);

  return result.rows;
}

module.exports = { findAll };