const jwt = require("jsonwebtoken");
const { pool } = require("../db");

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization ? authorization.split(" ") : [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error("JWT_SECRET is not configured"));
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!payload || !Number.isInteger(payload.userId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "SELECT id, username FROM users WHERE id = $1",
      [payload.userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = result.rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = authMiddleware;
