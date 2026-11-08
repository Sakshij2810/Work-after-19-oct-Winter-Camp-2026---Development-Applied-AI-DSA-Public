const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboard
} = require("../controller/taskController");

const router = express.Router();

router.post("/task", authMiddleware, createTask);
router.get("/tasks", authMiddleware, getTasks);
router.patch("/task/:taskId", authMiddleware, updateTask);
router.delete("/task/:taskId", authMiddleware, deleteTask);
router.get("/dashboard", authMiddleware, getDashboard);

module.exports = router;
