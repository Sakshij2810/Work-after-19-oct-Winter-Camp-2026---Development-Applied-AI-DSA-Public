const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createWorkspace,
  getWorkspaces,
  deleteWorkspace
} = require("../controller/workspaceController");

const router = express.Router();

router.post("/workspace", authMiddleware, createWorkspace);
router.get("/workspaces", authMiddleware, getWorkspaces);
router.delete("/workspace/:workspaceId", authMiddleware, deleteWorkspace);

module.exports = router;
