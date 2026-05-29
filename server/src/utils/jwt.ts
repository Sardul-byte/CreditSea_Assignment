import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return secret;
}

export function signToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, getJwtSecret());
  if (typeof payload === "string" || !payload || typeof payload !== "object") {
    throw new Error("Invalid token payload");
  }

  const { userId, role } = payload as JwtPayload;
  if (!userId || !role) {
    throw new Error("Invalid token payload");
  }

  return { userId: String(userId), role };
}
