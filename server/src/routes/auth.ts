import { Router } from "express";
import { z } from "zod";
import { EMPLOYMENT_MODES, User } from "../models/User";
import { comparePassword, hashPassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

const router = Router();

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, "Invalid PAN format")
    .optional(),
  dob: z.coerce
    .date({ invalid_type_error: "Invalid date of birth" })
    .optional(),
  monthlyIncome: z.coerce
    .number()
    .min(0, "Monthly income cannot be negative")
    .optional(),
  employmentMode: z
    .enum(EMPLOYMENT_MODES, {
      errorMap: () => ({ message: "Invalid employment mode" }),
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function formatUserResponse(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: string;
  pan: string;
  dob: Date;
  monthlyIncome: number;
  employmentMode: string;
  isEligible: boolean;
  createdAt: Date;
}) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    pan: user.pan,
    dob: user.dob,
    monthlyIncome: user.monthlyIncome,
    employmentMode: user.employmentMode,
    isEligible: user.isEligible,
    createdAt: user.createdAt,
  };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, password, pan, dob, monthlyIncome, employmentMode } =
    parsed.data;

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "borrower",
      pan: pan ?? "AAAAA0000A",
      dob: dob ?? new Date("1995-01-01"),
      monthlyIncome: monthlyIncome ?? 0,
      employmentMode: employmentMode ?? "salaried",
      isEligible: false,
    });

    const token = signToken(user._id.toString(), user.role);

    res.status(201).json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = signToken(user._id.toString(), user.role);

    res.json({
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
