// src/routes/userRoutes.ts
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Protected routes (require authentication)
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.get("/:id", authMiddleware, getUserById);

export default router;
