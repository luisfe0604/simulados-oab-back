const usersService = require("./users.service");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const user = await usersService.register(req.body);

    // 🔐 cria token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      user,
      token
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

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.send(`
    <script>
      window.opener.postMessage({ token: "${token}" }, "*");
      window.close();
    </script>
  `);
}

async function me(req, res) {

  try {
    const user = await usersService.findById(req.userId);

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, googleCallback, me };
