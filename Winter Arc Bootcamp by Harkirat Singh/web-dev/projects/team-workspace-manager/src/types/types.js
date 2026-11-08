const { z } = require("zod");

const signupSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(100),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const signinSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(200)
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").max(300),
  description: z.string().trim().max(5000).default(""),
  // Optional bonus field. Date must be YYYY-MM-DD and cannot be in the past.
  dueDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "dueDate must use YYYY-MM-DD format")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "dueDate must be a valid calendar date")
    .refine((value) => value >= new Date().toISOString().slice(0, 10),
      "Due date cannot be in the past")
    .optional()
});

const updateTaskSchema = z.object({
  completed: z.boolean()
});

module.exports = {
  signupSchema,
  signinSchema,
  createWorkspaceSchema,
  createTaskSchema,
  updateTaskSchema
};
