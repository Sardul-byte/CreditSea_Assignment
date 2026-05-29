import { Schema, model, Types } from "mongoose";

export interface IPayment {
  _id: Types.ObjectId;
  loan: Types.ObjectId;
  utrNumber: string;
  amount: number;
  date: Date;
  recordedBy: Types.ObjectId;
}

export const paymentSchema = new Schema<IPayment>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: "LoanApplication",
      required: [true, "Loan reference is required"],
    },
    utrNumber: {
      type: String,
      required: [true, "UTR number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0.01, "Payment amount must be greater than zero"],
    },
    date: {
      type: Date,
      required: [true, "Payment date is required"],
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recorded-by user is required"],
    },
  },
  {
    timestamps: false,
  }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
