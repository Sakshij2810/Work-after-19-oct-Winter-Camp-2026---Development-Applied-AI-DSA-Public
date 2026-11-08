const { pool } = require("../db");
const { createWorkspaceSchema } = require("../types/types");

// create workspace
async function createWorkspace(req, res, next) {
  const parsed = createWorkspaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO workspaces (name, user_id)
       VALUES ($1, $2)
       RETURNING id`,
      [parsed.data.name, req.user.id],
    );

    return res.status(201).json({ workspaceId: result.rows[0].id });
  } catch (error) {
    return next(error);
  }
}

// get workspace
async function getWorkspaces(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, user_id AS "userId"
       FROM workspaces
       WHERE user_id = $1
       ORDER BY id DESC`,
      [req.user.id],
    );

    return res.json({ workspaces: result.rows });
  } catch (error) {
    return next(error);
  }
}

// delete workspace
async function deleteWorkspace(req, res, next) {
  const workspaceId = Number(req.params.workspaceId);
  if (!Number.isSafeInteger(workspaceId) || workspaceId <= 0) {
    return res.status(400).json({ message: "Invalid workspaceId" });
  }

  try {
    // Ownership is checked in the DELETE statement itself.
    // The foreign key's ON DELETE CASCADE removes its tasks as well.
    const result = await pool.query(
      "DELETE FROM workspaces WHERE id = $1 AND user_id = $2 RETURNING id",
      [workspaceId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res.json({ message: "Workspace deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createWorkspace, getWorkspaces, deleteWorkspace };
