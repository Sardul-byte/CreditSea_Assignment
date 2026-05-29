import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { User } from "../models/User";

const router = Router();

router.use(authenticate, requireRole("sales", "admin"));

router.get("/leads", async (_req, res) => {
  try {
    const leads = await User.aggregate([
      { $match: { role: "borrower" } },
      {
        $lookup: {
          from: "loanapplications",
          localField: "_id",
          foreignField: "borrower",
          as: "loans",
        },
      },
      { $match: { loans: { $eq: [] } } },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: 1,
          email: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json({ leads });
  } catch (err) {
    console.error("Sales leads error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
