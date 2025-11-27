// src/routes/memberRoutes.ts
import express from "express";
import {
  getAllMembers,
  getMemberById,
  searchMembers,
} from "../controllers/memberController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", authMiddleware, getAllMembers);
router.get("/search", authMiddleware, searchMembers);
router.get("/:id", authMiddleware, getMemberById);

export default router;
