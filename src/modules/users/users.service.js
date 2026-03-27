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
    (name, email, password_hash, plan, subscription_status)
    VALUES ($1, $2, $3, 'free', 'inactive')
    RETURNING id, name, email`,
    [name, email, hashedPassword]
  );

  return result.rows[0];
}

async function findOrCreate({ name, email }) {
  const existing = await pool.query(
    "SELECT * FROM public.users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const result = await pool.query(
    `INSERT INTO public.users
      (name, email, plan, subscription_status, created_at)
     VALUES ($1, $2, 'free', 'inactive', NOW())
     RETURNING *`,
    [name, email]
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

function generateAuthResponse(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    hasAccess: hasAccess(user),
  };
}

function hasAccess(user) {
  const allowed = ["active", "trialing"];
  return allowed.includes(user.subscription_status);
}

async function getMetrics() {
  const totalUsersRes = await pool.query(`
    SELECT COUNT(*) FROM public.users;
  `);

  const statusRes = await pool.query(`
    SELECT subscription_status, COUNT(*) 
    FROM public.subscriptions
    GROUP BY subscription_status;
  `);

  const usersGrowthRes = await pool.query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COUNT(*) 
    FROM public.users
    GROUP BY month
    ORDER BY month;
  `);

  const subsGrowthRes = await pool.query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
      COUNT(*) 
    FROM public.subscriptions
    WHERE subscription_status = 'active'
    GROUP BY month
    ORDER BY month;
  `);

  const statusMap = {
    active: 0,
    trialing: 0,
    canceled: 0
  };

  statusRes.rows.forEach((row) => {
    statusMap[row.subscription_status] = Number(row.count);
  });

  return {
    total_users: Number(totalUsersRes.rows[0].count),
    status: statusMap,
    users_growth: usersGrowthRes.rows.map((r) => ({
      month: r.month,
      count: Number(r.count)
    })),
    subscriptions_growth: subsGrowthRes.rows.map((r) => ({
      month: r.month,
      count: Number(r.count)
    }))
  };
}

module.exports = { register, findOrCreate, login, findByEmail, findById, generateAuthResponse, getMetrics };
