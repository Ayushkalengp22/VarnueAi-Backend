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
router.get("/", getAllMembers);
router.get("/search", searchMembers);
router.get("/:id", getMemberById);

export default router;
