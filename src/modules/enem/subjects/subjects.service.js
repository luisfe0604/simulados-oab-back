const pool = require("../../../database/connection");

async function getSubjects() {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.name,
      COUNT(qs.question_id) AS total_questions
    FROM subjects_enem s
    LEFT JOIN question_subjects_enem qs 
      ON qs.subject_id = s.id
    GROUP BY s.id
    ORDER BY s.name ASC
  `);

  return result.rows;
}

module.exports = {
  getSubjects,
};