const usersService = require("./users.service");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const user = await usersService.register(req.body);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      user,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const data = await usersService.login(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function googleCallback(req, res) {
  const user = req.user;

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const system = req.query.state;

  const frontendUrl =
    system === "enem"
      ? process.env.FRONTEND_ENEM_URL
      : process.env.FRONTEND_URL;

  return res.redirect(`${frontendUrl}/auth-success?token=${token}`);
}

async function me(req, res) {
  try {
    const user = await usersService.findById(req.userId);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMetrics(req, res) {
  try {
    const data = await usersService.getMetrics();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar métricas" });
  }
}

async function listUsers(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search || "";

    const data = await usersService.listUsers({
      page,
      limit,
      search,
    });

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function toggleAdmin(req, res) {
  try {
    const userId = req.params.id;

    const data = await usersService.toggleAdmin(userId);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function grantPremium(req, res) {
  try {
    const userId = req.params.id;

    const data = await usersService.grantPremium(userId);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function revokePremium(req, res) {
  try {
    const user = await usersService.revokePremium(req.params.id);

    res.json(user);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function removeSubscription(req, res) {
  try {
    const user = await usersService.removeSubscription(req.params.id);

    res.json(user);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

async function getUser(req, res) {
  try {
    const user = await usersService.getUser(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    res.json(user);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  register,
  login,
  googleCallback,
  me,
  getMetrics,
  listUsers,
  toggleAdmin,
  grantPremium,
  revokePremium,
  removeSubscription,
  getUser,
};
