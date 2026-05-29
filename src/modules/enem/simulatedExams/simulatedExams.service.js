const pool = require("../../../database/connection");

async function finishSimulado({ userId, answers, duration_seconds }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const questionIds = answers.map((a) => a.question_id);

    const questionsResult = await client.query(
      `
      SELECT id, correct_option
      FROM public.questions_enem
      WHERE id = ANY($1)
      `,
      [questionIds],
    );

    const questions = questionsResult.rows;

    let correctAnswers = 0;

    const correctMap = {};
    questions.forEach((q) => {
      correctMap[q.id] = q.correct_option;
    });

    answers.forEach((answer) => {
      if (correctMap[answer.question_id] === answer.selected_option) {
        correctAnswers++;
      }
    });

    const totalQuestions = answers.length;
    const score = (correctAnswers / totalQuestions) * 100;

    const simulatedResult = await client.query(
      `
      INSERT INTO public.simulated_exams
      (user_id, total_questions, correct_answers, score, duration_seconds)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
      `,
      [userId, totalQuestions, correctAnswers, score, duration_seconds],
    );

    const simulatedExam = simulatedResult.rows[0];

    for (let answer of answers) {
      const isCorrect =
        correctMap[answer.question_id] === answer.selected_option;

      await client.query(
        `
        INSERT INTO public.simulated_exam_questions_enem
        (simulated_exam_id, question_id, selected_option, is_correct)
        VALUES ($1, $2, $3, $4)
        `,
        [
          simulatedExam.id,
          answer.question_id,
          answer.selected_option,
          isCorrect,
        ],
      );
    }

    await client.query("COMMIT");

    return {
      id: simulatedExam.id,
      totalQuestions,
      correctAnswers,
      score,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function listSimulados({ userId, page, limit }) {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT
      id,
      total_questions,
      correct_answers,
      score,
      created_at,
      duration_seconds
    FROM public.simulated_exams
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset],
  );

  const simulados = result.rows.map((s) => ({
    ...s,
    score: Number(s.score),
  }));

  const countResult = await pool.query(
    `
    SELECT COUNT(*) FROM public.simulated_exams
    WHERE user_id = $1
    `,
    [userId],
  );

  const total = parseInt(countResult.rows[0].count);

  return {
    data: simulados,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getSimuladoById({ userId, simulatedId }) {
  const simuladoResult = await pool.query(
    `
    SELECT id, total_questions, correct_answers, score, created_at
    FROM public.simulated_exams
    WHERE id = $1 AND user_id = $2
    `,
    [simulatedId, userId],
  );

  if (simuladoResult.rows.length === 0) {
    return null;
  }

  const simulado = simuladoResult.rows[0];

  const questionsResult = await pool.query(
    `
    SELECT
      q.id as question_id,
      q.statement,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.option_e,
      q.correct_option,
      seq.selected_option,
      seq.is_correct
    FROM public.simulated_exam_questions_enem seq
    JOIN public.questions q ON q.id = seq.question_id
    WHERE seq.simulated_exam_id = $1
    `,
    [simulatedId],
  );

  return {
    ...simulado,
    questions: questionsResult.rows,
  };
}

async function generateWrongQuestionsSimulado({ userId, limit = 20 }) {
  const wrongQuestions = await pool.query(
    `
    SELECT DISTINCT ON (seq.question_id)
      seq.question_id
      FROM public.simulated_exam_questions_enem seq
      JOIN public.simulated_exams se ON se.id = seq.simulated_exam_id
    WHERE se.user_id = $1
    AND seq.is_correct = false
    ORDER BY seq.question_id DESC
    LIMIT $2
    `,
    [userId, limit],
  );

  if (wrongQuestions.rows.length === 0) return [];

  const ids = wrongQuestions.rows.map((r) => r.question_id);

  const questions = await pool.query(
    `
    SELECT 
      q.*,
      e.name as exam_name
    FROM public.questions_enem q
    LEFT JOIN public.exams e ON e.id = q.exam_id
    WHERE q.id = ANY($1)
    `,
    [ids],
  );

  return questions.rows;
}

const ENEM_DAY_1_SUBJECTS_LIMITS = [
  { id: 3, limit: 45 }, // Linguagens
  { id: 1, limit: 45 }, // Ciências Humanas
];

const ENEM_DAY_2_SUBJECTS_LIMITS = [
  { id: 4, limit: 45 }, // Matemática
  { id: 2, limit: 45 }, // Ciências da Natureza
];

const ENEM_FULL_SUBJECTS_LIMITS = [
  { id: 1, limit: 45 }, // Ciências Humanas
  { id: 2, limit: 45 }, // Ciências da Natureza
  { id: 3, limit: 45 }, // Linguagens
  { id: 4, limit: 45 }, // Matemática
];

async function generateENEMDay1Simulado() {
  let simulado = [];

  for (const { id, limit } of ENEM_DAY_1_SUBJECTS_LIMITS) {
    const { rows } = await pool.query(
      `
      SELECT 
        q.*,
        e.name as exam_name
      FROM public.questions_enem q
      JOIN public.question_subjects_enem qs
        ON qs.question_id = q.id
      LEFT JOIN public.exams_enem e
        ON e.id = q.exam_id
      WHERE qs.subject_id = $1
      ORDER BY RANDOM()
      LIMIT $2
      `,
      [id, limit]
    );

    simulado = simulado.concat(rows);
  }

  return simulado;
}

async function generateENEMDay2Simulado() {
  let simulado = [];

  for (const { id, limit } of ENEM_DAY_2_SUBJECTS_LIMITS) {
    const { rows } = await pool.query(
      `
      SELECT 
        q.*,
        e.name as exam_name
      FROM public.questions_enem q
      JOIN public.question_subjects_enem qs
        ON qs.question_id = q.id
      LEFT JOIN public.exams_enem e
        ON e.id = q.exam_id
      WHERE qs.subject_id = $1
      ORDER BY RANDOM()
      LIMIT $2
      `,
      [id, limit]
    );

    simulado = simulado.concat(rows);
  }

  return simulado;
}

async function generateENEMFullSimulado() {
  let simulado = [];

  for (const { id, limit } of ENEM_FULL_SUBJECTS_LIMITS) {
    const { rows } = await pool.query(
      `
      SELECT 
        q.*,
        e.name as exam_name
      FROM public.questions_enem q
      JOIN public.question_subjects_enem qs
        ON qs.question_id = q.id
      LEFT JOIN public.exams_enem e
        ON e.id = q.exam_id
      WHERE qs.subject_id = $1
      ORDER BY RANDOM()
      LIMIT $2
      `,
      [id, limit]
    );

    simulado = simulado.concat(rows);
  }

  return simulado;
}

module.exports = {
  finishSimulado,
  listSimulados,
  getSimuladoById,
  generateWrongQuestionsSimulado,
  generateENEMFullSimulado,
  generateENEMDay2Simulado,
  generateENEMDay1Simulado
};
