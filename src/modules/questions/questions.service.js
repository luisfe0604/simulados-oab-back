const pool = require("../../database/connection");

async function create(data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      statement,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      correct_option,
      difficulty = 1,
      exam_id,
      subjects = []
    } = data;

    // Inserir questão
    const questionResult = await client.query(
      `
      INSERT INTO questions
      (statement, option_a, option_b, option_c, option_d, option_e, correct_option, difficulty, exam_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        statement,
        option_a,
        option_b,
        option_c,
        option_d,
        option_e,
        correct_option,
        difficulty,
        exam_id
      ]
    );

    const question = questionResult.rows[0];

    // Inserir assuntos (se existirem)
    for (let subjectId of subjects) {
      await client.query(
        `
        INSERT INTO question_subjects (question_id, subject_id)
        VALUES ($1,$2)
        `,
        [question.id, subjectId]
      );
    }

    await client.query("COMMIT");

    return question;

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function generate({ subject_id, limit }) {
  const values = [];
  let conditions = [];
  let index = 1;

  let query = `
    SELECT 
      q.*,
      e.name as exam_name
    FROM questions q
    LEFT JOIN exams e ON e.id = q.exam_id
  `;

  if (subject_id) {
    query += `
      JOIN question_subjects qs ON qs.question_id = q.id
    `;
    conditions.push(`qs.subject_id = $${index}`);
    values.push(parseInt(subject_id));
    index++;
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY RANDOM()`;

  const finalLimit =
    limit && !isNaN(parseInt(limit)) ? parseInt(limit) : 20;

  query += ` LIMIT $${index}`;
  values.push(finalLimit);

  const result = await pool.query(query, values);

  return result.rows;
}
module.exports = { create, generate };