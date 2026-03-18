const pool = require("../../database/connection");

async function getSubjects() {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.name,
      COUNT(qs.question_id) AS total_questions
    FROM public.subjects s
    LEFT JOIN public.question_subjects qs 
      ON qs.subject_id = s.id
    GROUP BY s.id
    ORDER BY s.name ASC
  `);

  return result.rows;
}

module.exports = {
  getSubjects,
};