const pool = require("../../database/connection");

async function finishSimulado({ userId, answers, duration_seconds }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Buscar respostas corretas das questões enviadas
    const questionIds = answers.map((a) => a.question_id);

    const questionsResult = await client.query(
      `
      SELECT id, correct_option
      FROM public.questions
      WHERE id = ANY($1)
      `,
      [questionIds],
    );

    const questions = questionsResult.rows;

    let correctAnswers = 0;

    // Criar mapa para facilitar busca
    const correctMap = {};
    questions.forEach((q) => {
      correctMap[q.id] = q.correct_option;
    });

    // Calcular acertos
    answers.forEach((answer) => {
      if (correctMap[answer.question_id] === answer.selected_option) {
        correctAnswers++;
      }
    });

    const totalQuestions = answers.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Criar simulado
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

    // Inserir respostas individuais
    for (let answer of answers) {
      const isCorrect =
        correctMap[answer.question_id] === answer.selected_option;

      await client.query(
        `
        INSERT INTO public.simulated_exam_questions
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
  // Buscar simulado (garantindo que pertence ao usuário)
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

  // Buscar questões do simulado
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
    FROM public.simulated_exam_questions seq
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
      FROM public.simulated_exam_questions seq
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
    FROM public.questions q
    LEFT JOIN public.exams e ON e.id = q.exam_id
    WHERE q.id = ANY($1)
    `,
    [ids],
  );

  return questions.rows;
}

const OAB_SUBJECTS_LIMITS = [
  { id: 61, limit: 8 }, // Ética Profissional
  { id: 62, limit: 2 }, // Filosofia do Direito
  { id: 63, limit: 6 }, // Direito Constitucional
  { id: 64, limit: 2 }, // Direitos Humanos
  { id: 78, limit: 2 }, // Direito Eleitoral
  { id: 65, limit: 2 }, // Direito Internacional
  { id: 79, limit: 2 }, // Direito Financeiro
  { id: 66, limit: 5 }, // Direito Tributário
  { id: 67, limit: 5 }, // Direito Administrativo
  { id: 68, limit: 2 }, // Direito Ambiental
  { id: 69, limit: 6 }, // Direito Civil
  { id: 70, limit: 2 }, // ECA
  { id: 71, limit: 2 }, // Direito do Consumidor
  { id: 72, limit: 4 }, // Direito Empresarial
  { id: 73, limit: 6 }, // Processo Civil
  { id: 74, limit: 6 }, // Direito Penal
  { id: 75, limit: 6 }, // Processo Penal
  { id: 80, limit: 2 }, // Direito Previdenciário
  { id: 76, limit: 5 }, // Direito do Trabalho
  { id: 77, limit: 5 }, // Processo do Trabalho
];

async function generateOABSimulado() {
  let simulado = [];

  for (const { id, limit } of OAB_SUBJECTS_LIMITS) {
    const { rows } = await pool.query(
      `
      SELECT 
        q.*,
        e.name as exam_name
      FROM public.questions q
      JOIN public.question_subjects qs
        ON qs.question_id = q.id
      LEFT JOIN exams e ON e.id = q.exam_id
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
  generateOABSimulado,
};
