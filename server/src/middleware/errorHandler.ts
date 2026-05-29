import type { ErrorRequestHandler, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

function formatZodError(error: ZodError): {
  message: string;
  errors: Record<string, string[]>;
} {
  const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>;
  const first = Object.values(fieldErrors).flat()[0];
  return {
    message: first ?? "Validation failed",
    errors: fieldErrors,
  };
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next
) => {
  if (err instanceof ZodError) {
    const { message, errors } = formatZodError(err);
    res.status(400).json({ success: false, message, errors });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [path, e] of Object.entries(err.errors)) {
      errors[path] = [e.message];
    }
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
    return;
  }

  if (err instanceof Error) {
    const status =
      "status" in err && typeof err.status === "number" ? err.status : 500;
    const message =
      status === 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message;

    console.error(err);
    res.status(status).json({ success: false, message });
    return;
  }

  console.error("Unknown error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
};

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: "Not found" });
}
