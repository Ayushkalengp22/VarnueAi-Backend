// // src/routes/authRoutes.ts
// import express from "express";
// import { sendOTP, verifyOTP, register } from "../controllers/authController";

// const router = express.Router();

// router.post("/send-otp", sendOTP);
// router.post("/verify-otp", verifyOTP);
// router.post("/register", register);

// export default router;

// src/routes/authRoutes.ts
import express from "express";
import {
  sendOTP,
  verifyOTP,
  register,
  resendOTP,
} from "../controllers/authController";

const router = express.Router();

// Login flow
router.post("/send-otp", sendOTP); // Step 1: Send OTP
router.post("/verify-otp", verifyOTP); // Step 2: Verify OTP & Login
router.post("/resend-otp", resendOTP); // Resend OTP

// Registration
router.post("/register", register); // New member registration

export default router;
