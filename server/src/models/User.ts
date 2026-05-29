import { Schema, model, Types } from "mongoose";

export const USER_ROLES = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
  "borrower",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const EMPLOYMENT_MODES = [
  "salaried",
  "self-employed",
  "unemployed",
] as const;

export type EmploymentMode = (typeof EMPLOYMENT_MODES)[number];

/** 0 = not started, 1 = profile verified, 2 = salary slip uploaded */
export const APPLY_STEPS = [0, 1, 2] as const;
export type ApplyStep = (typeof APPLY_STEPS)[number];

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  pan: string;
  dob: Date;
  monthlyIncome: number;
  employmentMode: EmploymentMode;
  isEligible: boolean;
  applyStep: ApplyStep;
  salarySlipUrl?: string;
  createdAt: Date;
}

export const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
    },
    pan: {
      type: String,
      required: [true, "PAN is required"],
      uppercase: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    monthlyIncome: {
      type: Number,
      required: [true, "Monthly income is required"],
      min: [0, "Monthly income cannot be negative"],
    },
    employmentMode: {
      type: String,
      enum: {
        values: EMPLOYMENT_MODES,
        message: "{VALUE} is not a valid employment mode",
      },
      required: [true, "Employment mode is required"],
    },
    isEligible: {
      type: Boolean,
      default: false,
    },
    applyStep: {
      type: Number,
      enum: {
        values: APPLY_STEPS,
        message: "{VALUE} is not a valid apply step",
      },
      default: 0,
    },
    salarySlipUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User = model<IUser>("User", userSchema);
