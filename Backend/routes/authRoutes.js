import express from "express";
import { signup, login, me, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { authLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/me", requireAuth, me);

router.post("/logout", logout);

router.post("/signup", authLimiter, signup);

router.post("/login", authLimiter, login);

export default router;