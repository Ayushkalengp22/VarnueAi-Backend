// src/routes/eventRoutes.ts
import express from "express";
import { getAllEvents } from "../controllers/eventController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllEvents);

export default router;
