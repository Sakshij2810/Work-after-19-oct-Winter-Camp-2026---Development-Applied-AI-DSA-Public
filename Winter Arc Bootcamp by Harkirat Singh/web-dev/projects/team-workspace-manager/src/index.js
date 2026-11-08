require("dotenv").config();

const express = require("express");
const { pool } = require("./db");
const authRoutes = require("./routes/authRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Team Workspace Manager API is running" });
});

app.use("/", authRoutes);
app.use("/", workspaceRoutes);
app.use("/", taskRoutes);

// Unknown endpoint
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Central error handler. Avoid returning database internals to clients.
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);

  return res.status(error.status || 500).json({
    message: error.status ? error.message : "Internal server error"
  });
});

const port = Number(process.env.PORT) || 3000;

async function startServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Add it to your .env file.");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Add it to your .env file.");
  }

  // Fail early if PostgreSQL is not reachable.
  await pool.query("SELECT 1");

  app.listen(port, () => {
    console.log(`Team Workspace Manager API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Could not start the server:", error.message);
  process.exit(1);
});

module.exports = app;
