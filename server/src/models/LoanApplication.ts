import { Schema, model, Types } from "mongoose";

export const LOAN_STATUSES = [
  "applied",
  "sanctioned",
  "disbursed",
  "closed",
  "rejected",
] as const;

export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const LOAN_AMOUNT_MIN = 50_000;
export const LOAN_AMOUNT_MAX = 500_000;
export const TENURE_MIN_DAYS = 30;
export const TENURE_MAX_DAYS = 365;
export const FIXED_INTEREST_RATE = 12;

export interface ILoanApplication {
  _id: Types.ObjectId;
  borrower: Types.ObjectId;
  status: LoanStatus;
  loanAmount: number;
  tenureInDays: number;
  interestRate: number;
  totalRepayment: number;
  salarySlipUrl?: string;
  rejectionReason?: string;
  sanctionedBy?: Types.ObjectId;
  disbursedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export function calculateTotalRepayment(
  loanAmount: number,
  tenureInDays: number,
  interestRate: number = FIXED_INTEREST_RATE
): number {
  const annualRate = interestRate / 100;
  return Math.round(
    loanAmount + loanAmount * annualRate * (tenureInDays / 365)
  );
}

export const loanApplicationSchema = new Schema<ILoanApplication>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Borrower is required"],
    },
    status: {
      type: String,
      enum: {
        values: LOAN_STATUSES,
        message: "{VALUE} is not a valid loan status",
      },
      default: "applied",
    },
    loanAmount: {
      type: Number,
      required: [true, "Loan amount is required"],
      min: [LOAN_AMOUNT_MIN, `Loan amount must be at least ${LOAN_AMOUNT_MIN}`],
      max: [LOAN_AMOUNT_MAX, `Loan amount must not exceed ${LOAN_AMOUNT_MAX}`],
    },
    tenureInDays: {
      type: Number,
      required: [true, "Tenure is required"],
      min: [TENURE_MIN_DAYS, `Tenure must be at least ${TENURE_MIN_DAYS} days`],
      max: [TENURE_MAX_DAYS, `Tenure must not exceed ${TENURE_MAX_DAYS} days`],
    },
    interestRate: {
      type: Number,
      default: FIXED_INTEREST_RATE,
      immutable: true,
    },
    totalRepayment: {
      type: Number,
      required: true,
    },
    salarySlipUrl: {
      type: String,
      trim: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    sanctionedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

function setTotalRepayment(doc: {
  loanAmount?: number;
  tenureInDays?: number;
  interestRate?: number;
  totalRepayment?: number;
}): void {
  if (doc.loanAmount == null || doc.tenureInDays == null) return;
  doc.totalRepayment = calculateTotalRepayment(
    doc.loanAmount,
    doc.tenureInDays,
    doc.interestRate ?? FIXED_INTEREST_RATE
  );
}

loanApplicationSchema.pre("validate", function (next) {
  setTotalRepayment(this);
  next();
});

loanApplicationSchema.pre("save", function (next) {
  setTotalRepayment(this);
  next();
});

loanApplicationSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const update = this.getUpdate();
    if (!update || typeof update !== "object") {
      return next();
    }

    const doc = ("$set" in update ? update.$set : update) as Record<
      string,
      unknown
    >;

    const loanAmount = doc.loanAmount as number | undefined;
    const tenureInDays = doc.tenureInDays as number | undefined;
    const interestRate =
      (doc.interestRate as number | undefined) ?? FIXED_INTEREST_RATE;

    if (loanAmount !== undefined && tenureInDays !== undefined) {
      const setPayload =
        "$set" in update && update.$set
          ? (update.$set as Record<string, unknown>)
          : (update as Record<string, unknown>);

      setPayload.totalRepayment = calculateTotalRepayment(
        loanAmount,
        tenureInDays,
        interestRate
      );
    }

    next();
  }
);

export const LoanApplication = model<ILoanApplication>(
  "LoanApplication",
  loanApplicationSchema
);
