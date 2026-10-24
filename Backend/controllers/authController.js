import bcrypt from "bcrypt";
import { z } from "zod";
import User from "../models/User.js";
import { setAuthCookie, cookieOptions } from "../utils/setAuthCookie.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().optional().default(""),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/\d/, "Password must contain a digit")
    .regex(/[^A-Za-z0-9\s]/, "Password must contain a special character"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const userExistsResponse = (res) =>
  res.status(409).json({
    message: "An account with this email already exists. Please log in.",
    userExists: true,
  });

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { name, email, phone, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) return userExistsResponse(res);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, phone, passwordHash });
    setAuthCookie(res, user._id);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    // Two people signing up with the same email at the same moment
    if (error.code === 11000) return userExistsResponse(res);
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ message: "Enter your email and password" });
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+passwordHash");

    // Unknown email: same generic error, nothing to lock
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 1. Is the account currently locked? Check BEFORE the password.
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutes = Math.ceil((user.lockUntil - new Date()) / 60000);
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
        locked: true,
      });
    }

    // 2. Check the password
    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      // The old lock has expired: start counting from zero again
      if (user.lockUntil) {
        user.lockUntil = null;
        user.failedLoginAttempts = 0;
      }

      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0;
        await user.save();
        return res.status(429).json({
          message: `Too many failed attempts. Your account is locked for ${LOCK_MINUTES} minutes. Please try again later.`,
          locked: true,
        });
      }

      await user.save();
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Correct password: clear the counters
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    setAuthCookie(res, user._id);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me   (protected)
export const me = (req, res) => {
  const { _id, name, email, phone } = req.user;
  res.json({ user: { id: _id, name, email, phone } });
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
};