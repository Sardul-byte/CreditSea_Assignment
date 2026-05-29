import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import type { UserRole } from "./models/User";
import { User } from "./models/User";
import { hashPassword } from "./utils/hash";

dotenv.config({ path: path.join(__dirname, "../../.env") });

// Solves querySrv ECONNREFUSED error on Windows/certain network environments when resolving Atlas SRV records
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("Failed to set DNS servers, proceeding with default resolution:", err);
}


interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  pan: string;
  dob: Date;
  monthlyIncome: number;
  employmentMode: "salaried" | "self-employed" | "unemployed";
  isEligible: boolean;
}

const SEED_USERS: SeedUser[] = [
  {
    name: "Admin User",
    email: "admin@lms.com",
    password: "Admin@123",
    role: "admin",
    pan: "AAAAA0000A",
    dob: new Date("1985-06-15"),
    monthlyIncome: 100_000,
    employmentMode: "salaried",
    isEligible: false,
  },
  {
    name: "Sales User",
    email: "sales@lms.com",
    password: "Sales@123",
    role: "sales",
    pan: "BBBBB0000B",
    dob: new Date("1988-03-20"),
    monthlyIncome: 80_000,
    employmentMode: "salaried",
    isEligible: false,
  },
  {
    name: "Sanction User",
    email: "sanction@lms.com",
    password: "Sanction@123",
    role: "sanction",
    pan: "CCCCC0000C",
    dob: new Date("1987-11-10"),
    monthlyIncome: 85_000,
    employmentMode: "salaried",
    isEligible: false,
  },
  {
    name: "Disbursement User",
    email: "disbursement@lms.com",
    password: "Disbursement@123",
    role: "disbursement",
    pan: "DDDDD0000D",
    dob: new Date("1986-01-25"),
    monthlyIncome: 82_000,
    employmentMode: "salaried",
    isEligible: false,
  },
  {
    name: "Collection User",
    email: "collection@lms.com",
    password: "Collection@123",
    role: "collection",
    pan: "EEEEE0000E",
    dob: new Date("1989-08-05"),
    monthlyIncome: 78_000,
    employmentMode: "salaried",
    isEligible: false,
  },
  {
    name: "Borrower User",
    email: "borrower@lms.com",
    password: "Borrower@123",
    role: "borrower",
    pan: "FGHPJ5678K",
    dob: new Date("1992-04-12"),
    monthlyIncome: 45_000,
    employmentMode: "salaried",
    isEligible: true,
  },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment");
  }

  // Print censored URI to verify it's loaded correctly
  const censoredUri = uri.replace(/:([^:@]+)@/, ":****@");
  console.log(`Connecting to: ${censoredUri}`);

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.\n");

  for (const user of SEED_USERS) {
    const existed = await User.exists({ email: user.email.toLowerCase() });
    const hashedPassword = await hashPassword(user.password);

    await User.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      {
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: user.role,
        pan: user.pan,
        dob: user.dob,
        monthlyIncome: user.monthlyIncome,
        employmentMode: user.employmentMode,
        isEligible: user.isEligible,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const action = existed ? "Updated" : "Created";
    console.log(`${action}: ${user.email} (role: ${user.role})`);
  }

  await mongoose.disconnect();
  console.log("\nSeed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
