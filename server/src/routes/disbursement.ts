import { Router } from "express";
import mongoose from "mongoose";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { LoanApplication } from "../models/LoanApplication";

const router = Router();

router.use(authenticate, requireRole("disbursement", "admin"));

router.get("/applications", async (_req, res) => {
  try {
    const applications = await LoanApplication.find({ status: "sanctioned" })
      .populate("borrower", "name email pan monthlyIncome employmentMode")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ applications });
  } catch (err) {
    console.error("Disbursement applications error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/applications/:id/disburse", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid application id" });
    return;
  }

  try {
    const loan = await LoanApplication.findOneAndUpdate(
      { _id: id, status: "sanctioned" },
      {
        status: "disbursed",
        disbursedBy: req.user!.id,
      },
      { new: true }
    ).populate("borrower", "name email pan monthlyIncome employmentMode");

    if (!loan) {
      res.status(404).json({
        message: "Application not found or not in sanctioned status",
      });
      return;
    }

    res.json({ application: loan });
  } catch (err) {
    console.error("Disbursement error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
