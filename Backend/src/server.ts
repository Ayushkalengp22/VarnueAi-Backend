// src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Load environment variables FIRST
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { testConnection } from "./config/supabase";

// Import routes
import authRoutes from "./routes/authRoutes";
import memberRoutes from "./routes/memberRoutes";
import eventRoutes from "./routes/eventRoutes";
import userRoutes from "./routes/userRoutes"; // ← ADD THIS

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Rotary Club Nagpur API is running",
    version: "1.0.0",
  });
});
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes); // ← ADD THIS

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const startServer = async () => {
  try {
    console.log("🔧 Environment:", process.env.NODE_ENV);
    console.log("📍 Port:", process.env.PORT);
    console.log(
      "📍 Supabase URL:",
      process.env.SUPABASE_URL ? "Loaded" : "Missing"
    );

    // Test Supabase connection
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
