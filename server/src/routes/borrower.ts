import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { salarySlipUpload } from "../middleware/upload";
import {
  calculateTotalRepayment,
  FIXED_INTEREST_RATE,
  LOAN_AMOUNT_MAX,
  LOAN_AMOUNT_MIN,
  LoanApplication,
  TENURE_MAX_DAYS,
  TENURE_MIN_DAYS,
} from "../models/LoanApplication";
import { Payment } from "../models/Payment";
import { EMPLOYMENT_MODES, User } from "../models/User";
import { runBRE } from "../utils/bre";

const router = Router();

router.use(authenticate, requireRole("borrower"));

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(panRegex, "Invalid PAN format"),
  dob: z.coerce.date({ invalid_type_error: "Invalid date of birth" }),
  monthlyIncome: z.coerce
    .number()
    .min(0, "Monthly income cannot be negative"),
  employmentMode: z.enum(EMPLOYMENT_MODES, {
    errorMap: () => ({ message: "Invalid employment mode" }),
  }),
});

const applySchema = z.object({
  loanAmount: z.coerce
    .number()
    .min(LOAN_AMOUNT_MIN, `Loan amount must be at least ${LOAN_AMOUNT_MIN}`)
    .max(LOAN_AMOUNT_MAX, `Loan amount must not exceed ${LOAN_AMOUNT_MAX}`),
  tenureInDays: z.coerce
    .number()
    .min(TENURE_MIN_DAYS, `Tenure must be at least ${TENURE_MIN_DAYS} days`)
    .max(TENURE_MAX_DAYS, `Tenure must not exceed ${TENURE_MAX_DAYS} days`),
});

router.get("/apply-status", async (req, res) => {
  try {
    const user = await User.findById(req.user!.id)
      .select(
        "applyStep isEligible salarySlipUrl name pan dob monthlyIncome employmentMode"
      )
      .lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const applyStep = user.applyStep ?? 0;

    res.json({
      applyStep,
      isEligible: applyStep >= 1 && user.isEligible,
      hasSalarySlip: applyStep >= 2 && Boolean(user.salarySlipUrl),
      profile: {
        name: user.name,
        pan: user.pan,
        dob: user.dob
          ? new Date(user.dob).toISOString().slice(0, 10)
          : "",
        monthlyIncome: user.monthlyIncome,
        employmentMode: user.employmentMode,
      },
    });
  } catch (err) {
    console.error("Apply status fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/start-application", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        $set: { isEligible: false, applyStep: 0 },
        $unset: { salarySlipUrl: "" },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      applyStep: user.applyStep,
      isEligible: false,
      hasSalarySlip: false,
    });
  } catch (err) {
    console.error("Start application error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/profile", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, pan, dob, monthlyIncome, employmentMode } = parsed.data;

  try {
    const bre = runBRE({ dob, monthlyIncome, pan, employmentMode });

    const update: Record<string, unknown> = {
      ...(name !== undefined && { name }),
      pan,
      dob,
      monthlyIncome,
      employmentMode,
      isEligible: bre.passed,
      applyStep: bre.passed ? 1 : 0,
    };

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      bre.passed
        ? { $set: update, $unset: { salarySlipUrl: "" } }
        : { $set: update },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      bre,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        pan: user.pan,
        dob: user.dob,
        monthlyIncome: user.monthlyIncome,
        employmentMode: user.employmentMode,
        isEligible: user.isEligible,
        salarySlipUrl: user.salarySlipUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/upload-salary-slip", (req, res, next) => {
  salarySlipUpload.single("salarySlip")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "File size must not exceed 5MB" });
        return;
      }
      res.status(400).json({
        message: err.message || "File upload failed",
      });
      return;
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Salary slip file is required" });
    return;
  }

  const salarySlipUrl = `/uploads/${req.file.filename}`;

  try {
    const existing = await User.findById(req.user!.id).select(
      "isEligible applyStep"
    );
    if (!existing) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!existing.isEligible || (existing.applyStep ?? 0) < 1) {
      res.status(403).json({
        message: "Complete personal details and pass eligibility first",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id,
      {
        salarySlipUrl,
        applyStep: 2,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      salarySlipUrl: user.salarySlipUrl,
    });
  } catch (err) {
    console.error("Salary slip upload error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/apply", async (req, res) => {
  const parsed = applySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isEligible || (user.applyStep ?? 0) < 1) {
      res.status(403).json({
        message: "You are not eligible for a loan",
      });
      return;
    }

    if ((user.applyStep ?? 0) < 2 || !user.salarySlipUrl) {
      res.status(403).json({
        message: "Please upload your salary slip before applying",
      });
      return;
    }

    const { loanAmount, tenureInDays } = parsed.data;

    const loan = await LoanApplication.create({
      borrower: user._id,
      status: "applied",
      loanAmount,
      tenureInDays,
      interestRate: FIXED_INTEREST_RATE,
      totalRepayment: calculateTotalRepayment(
        loanAmount,
        tenureInDays,
        FIXED_INTEREST_RATE
      ),
      salarySlipUrl: user.salarySlipUrl,
    });

    await User.findByIdAndUpdate(req.user!.id, {
      $set: { isEligible: false, applyStep: 0 },
      $unset: { salarySlipUrl: "" },
    });

    res.status(201).json({ loan });
  } catch (err) {
    console.error("Loan apply error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/my-loans", async (req, res) => {
  try {
    const loans = await LoanApplication.find({ borrower: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();

    if (loans.length === 0) {
      res.json({ loans: [] });
      return;
    }

    const loanIds = loans.map((loan) => loan._id);
    const allPayments = await Payment.find({ loan: { $in: loanIds } })
      .sort({ date: -1 })
      .lean();

    const paymentsByLoan = new Map<string, typeof allPayments>();
    for (const payment of allPayments) {
      const key = payment.loan.toString();
      const existing = paymentsByLoan.get(key);
      if (existing) {
        existing.push(payment);
      } else {
        paymentsByLoan.set(key, [payment]);
      }
    }

    res.json({
      loans: loans.map((loan) => ({
        loan,
        payments: paymentsByLoan.get(loan._id.toString()) ?? [],
      })),
    });
  } catch (err) {
    console.error("My loans fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/** @deprecated Use GET /my-loans — returns latest loan only for backward compatibility */
router.get("/my-loan", async (req, res) => {
  try {
    const loan = await LoanApplication.findOne({ borrower: req.user!.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!loan) {
      res.json({ loan: null, payments: [] });
      return;
    }

    const payments = await Payment.find({ loan: loan._id })
      .sort({ date: -1 })
      .lean();

    res.json({ loan, payments });
  } catch (err) {
    console.error("My loan fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
