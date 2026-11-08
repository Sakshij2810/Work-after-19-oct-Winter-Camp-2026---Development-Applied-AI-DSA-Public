const { pool } = require("../db");
const { createTaskSchema, updateTaskSchema } = require("../types/types");

function parsePositiveInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function parsePagination(value, fallback) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

// create task
async function createTask(req, res, next) {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  const workspaceId = parsePositiveInteger(req.headers.workspaceid);
  if (!workspaceId) {
    return res
      .status(400)
      .json({ message: "A valid workspaceid header is required" });
  }

  const { title, description, dueDate } = parsed.data;

  try {
    // A single INSERT ... SELECT enforces workspace ownership in the database.
    const result = await pool.query(
      `INSERT INTO tasks (title, description, workspace_id, due_date)
       SELECT $1, $2, w.id, $4
       FROM workspaces w
       WHERE w.id = $3 AND w.user_id = $5
       RETURNING id`,
      [title, description, workspaceId, dueDate || null, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res.status(201).json({ taskId: result.rows[0].id });
  } catch (error) {
    return next(error);
  }
}

// get task
async function getTasks(req, res, next) {
  const workspaceId = parsePositiveInteger(req.headers.workspaceid);
  if (!workspaceId) {
    return res
      .status(400)
      .json({ message: "A valid workspaceid header is required" });
  }

  const page = parsePagination(req.query.page, 1);
  const limit = parsePagination(req.query.limit, 10);

  if (!page || page < 1 || !limit || limit < 1 || limit > 100) {
    return res.status(400).json({
      message: "page must be >= 1 and limit must be between 1 and 100",
    });
  }

  const search =
    typeof req.query.search === "string" ? req.query.search.trim() : "";
  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({ message: "Invalid pagination values" });
  }

  try {
    // Both workspace ownership and task filtering happen in SQL.
    const result = await pool.query(
      `SELECT t.id, t.title, t.description, t.completed,
              t.workspace_id AS "workspaceId",
              t.due_date AS "dueDate"
       FROM tasks t
       JOIN workspaces w ON w.id = t.workspace_id
       WHERE w.user_id = $1
         AND w.id = $2
         AND ($3 = '' OR t.title ILIKE '%' || $3 || '%' OR t.description ILIKE '%' || $3 || '%')
       ORDER BY t.id DESC
       LIMIT $4 OFFSET $5`,
      [req.user.id, workspaceId, search, limit, offset],
    );

    return res.json({
      tasks: result.rows,
      pagination: { page, limit },
    });
  } catch (error) {
    return next(error);
  }
}

// update task
async function updateTask(req, res, next) {
  const taskId = parsePositiveInteger(req.params.taskId);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid taskId" });
  }

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
  }

  try {
    // Update succeeds only if this task belongs to a workspace owned by the user.
    const result = await pool.query(
      `UPDATE tasks AS t
       SET completed = $1
       FROM workspaces AS w
       WHERE t.workspace_id = w.id
         AND t.id = $2
         AND w.user_id = $3
       RETURNING t.id`,
      [parsed.data.completed, taskId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task updated" });
  } catch (error) {
    return next(error);
  }
}

// delete task
async function deleteTask(req, res, next) {
  const taskId = parsePositiveInteger(req.params.taskId);
  if (!taskId) {
    return res.status(400).json({ message: "Invalid taskId" });
  }

  try {
    // Ownership check is part of the DELETE query.
    const result = await pool.query(
      `DELETE FROM tasks AS t
       USING workspaces AS w
       WHERE t.workspace_id = w.id
         AND t.id = $1
         AND w.user_id = $2
       RETURNING t.id`,
      [taskId, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
}

// get dashboard
async function getDashboard(req, res, next) {
  try {
    // One SQL query computes all requested counts for the authenticated user.
    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int
          FROM workspaces
          WHERE user_id = $1) AS "totalWorkspaces",
         COUNT(t.id)::int AS "totalTasks",
         COUNT(t.id) FILTER (WHERE t.completed = TRUE)::int AS "completedTasks",
         COUNT(t.id) FILTER (WHERE t.completed = FALSE)::int AS "pendingTasks"
       FROM workspaces w
       LEFT JOIN tasks t ON t.workspace_id = w.id
       WHERE w.user_id = $1`,
      [req.user.id],
    );

    return res.json(result.rows[0]);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboard,
};
