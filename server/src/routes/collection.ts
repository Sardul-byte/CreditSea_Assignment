import { Router } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { LoanApplication } from "../models/LoanApplication";
import { Payment } from "../models/Payment";

const router = Router();

router.use(authenticate, requireRole("collection", "admin"));

const paymentSchema = z.object({
  utrNumber: z.string().trim().min(1, "UTR number is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  date: z.coerce.date().optional(),
});

router.get("/loans", async (_req, res) => {
  try {
    const loans = await LoanApplication.aggregate([
      { $match: { status: "disbursed" } },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "loan",
          as: "payments",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "borrower",
          foreignField: "_id",
          as: "borrowerDoc",
        },
      },
      { $unwind: { path: "$borrowerDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          totalPaid: {
            $sum: "$payments.amount",
          },
        },
      },
      {
        $addFields: {
          outstandingBalance: {
            $subtract: ["$totalRepayment", "$totalPaid"],
          },
        },
      },
      {
        $project: {
          id: { $toString: "$_id" },
          status: 1,
          loanAmount: 1,
          tenureInDays: 1,
          interestRate: 1,
          totalRepayment: 1,
          totalPaid: 1,
          outstandingBalance: 1,
          salarySlipUrl: 1,
          createdAt: 1,
          updatedAt: 1,
          borrower: {
            id: { $toString: "$borrowerDoc._id" },
            name: "$borrowerDoc.name",
            email: "$borrowerDoc.email",
            pan: "$borrowerDoc.pan",
            monthlyIncome: "$borrowerDoc.monthlyIncome",
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ loans });
  } catch (err) {
    console.error("Collection loans error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/loans/:id/payment", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid loan id" });
    return;
  }

  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { utrNumber, amount, date } = parsed.data;
  const normalizedUtr = utrNumber.toUpperCase();

  try {
    const existingUtr = await Payment.findOne({ utrNumber: normalizedUtr });
    if (existingUtr) {
      res.status(409).json({ message: "UTR number already exists" });
      return;
    }

    const loan = await LoanApplication.findOne({
      _id: id,
      status: "disbursed",
    });

    if (!loan) {
      res.status(404).json({
        message: "Loan not found or not in disbursed status",
      });
      return;
    }

    const payments = await Payment.find({ loan: loan._id });
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = loan.totalRepayment - totalPaid;

    if (amount > outstandingBalance) {
      res.status(400).json({
        message: `Amount exceeds outstanding balance of ${outstandingBalance}`,
      });
      return;
    }

    const payment = await Payment.create({
      loan: loan._id,
      utrNumber: normalizedUtr,
      amount,
      date: date ?? new Date(),
      recordedBy: req.user!.id,
    });

    const newTotalPaid = totalPaid + amount;
    let updatedLoan = loan;

    if (newTotalPaid >= loan.totalRepayment) {
      updatedLoan =
        (await LoanApplication.findByIdAndUpdate(
          loan._id,
          { status: "closed" },
          { new: true }
        )) ?? loan;
    }

    res.status(201).json({
      payment,
      loan: updatedLoan,
      totalPaid: newTotalPaid,
      outstandingBalance: Math.max(loan.totalRepayment - newTotalPaid, 0),
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === 11000
    ) {
      res.status(409).json({ message: "UTR number already exists" });
      return;
    }

    console.error("Collection payment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
