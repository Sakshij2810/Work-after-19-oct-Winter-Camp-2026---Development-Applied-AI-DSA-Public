const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { signupSchema, signinSchema } = require("../types/types");

async function signup(req, res, next) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const { username, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users (username, password)
       VALUES ($1, $2)`,
      [username, passwordHash],
    );

    return res.status(201).json({ message: "User created" });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Username already exists" });
    }
    return next(error);
  }
}

async function signin(req, res, next) {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const { username, password } = parsed.data;

  try {
    const result = await pool.query(
      "SELECT id, username, password FROM users WHERE username = $1",
      [username],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error("JWT_SECRET is not configured"));
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, signin };
