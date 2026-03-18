const pool = require("../../database/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register({ name, email, password }) {
  if (password.length < 6 || password == null) {
    throw new Error("Senha deve ter pelo menos 6 caracteres");
  }

  const existing = await pool.query(
    "SELECT id FROM public.users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    throw new Error("Email já cadastrado");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO public.users 
    (name, email, password_hash, plan, subscription_status, trial_end)
    VALUES ($1, $2, $3, 'trial', 'trial', NOW() + INTERVAL '7 days')
    RETURNING id, name, email`,
    [name, email, hashedPassword]
  );

  return result.rows[0];
}

async function create({ name, email, password }) {
  let passwordHash = null;

  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const result = await pool.query(
    `INSERT INTO public.users
      (name, email, password_hash, plan, subscription_status, trial_end, created_at)
     VALUES ($1, $2, $3, 'trial', 'trial', NOW() + INTERVAL '7 days', NOW())
     RETURNING *`,
    [name, email, passwordHash]
  );

  return result.rows[0];
}

async function login({ email, password }) {
  const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [
    email,
  ]);

  const user = result.rows[0];

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);

  if (!validPassword) {
    throw new Error("Senha inválida");
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  return { token };
}

async function findByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE email = $1",
    [email]
  );

  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    "SELECT * FROM public.users WHERE id = $1",
    [id]
  );

  return result.rows[0];
}

module.exports = { register, create, login, findByEmail, findById };
