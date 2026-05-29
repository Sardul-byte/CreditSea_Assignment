import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
