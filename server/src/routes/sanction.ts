import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { LoanApplication } from "../models/LoanApplication";

const router = Router();

router.use(authenticate, requireRole("sanction", "admin"));

const rejectSchema = z.object({
  rejectionReason: z.string().trim().min(1, "Rejection reason is required"),
});

router.get("/applications", async (_req, res) => {
  try {
    const applications = await LoanApplication.find({ status: "applied" })
      .populate("borrower", "name pan monthlyIncome")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = applications.map((app) => {
      const borrower = app.borrower as {
        name?: string;
        pan?: string;
        monthlyIncome?: number;
      } | null;

      return {
        id: app._id.toString(),
        status: app.status,
        loanAmount: app.loanAmount,
        tenureInDays: app.tenureInDays,
        totalRepayment: app.totalRepayment,
        salarySlipUrl: app.salarySlipUrl,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        borrower: borrower
          ? {
              name: borrower.name,
              pan: borrower.pan,
              income: borrower.monthlyIncome,
            }
          : null,
      };
    });

    res.json({ applications: formatted });
  } catch (err) {
    console.error("Sanction applications error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/applications/:id/approve", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid application id" });
    return;
  }

  try {
    const loan = await LoanApplication.findOneAndUpdate(
      { _id: id, status: "applied" },
      {
        status: "sanctioned",
        sanctionedBy: req.user!.id,
        rejectionReason: undefined,
      },
      { new: true }
    ).populate("borrower", "name pan monthlyIncome");

    if (!loan) {
      res.status(404).json({
        message: "Application not found or not in applied status",
      });
      return;
    }

    res.json({ application: loan });
  } catch (err) {
    console.error("Sanction approve error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/applications/:id/reject", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid application id" });
    return;
  }

  const parsed = rejectSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const loan = await LoanApplication.findOneAndUpdate(
      { _id: id, status: "applied" },
      {
        status: "rejected",
        rejectionReason: parsed.data.rejectionReason,
        sanctionedBy: req.user!.id,
      },
      { new: true }
    ).populate("borrower", "name pan monthlyIncome");

    if (!loan) {
      res.status(404).json({
        message: "Application not found or not in applied status",
      });
      return;
    }

    res.json({ application: loan });
  } catch (err) {
    console.error("Sanction reject error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
