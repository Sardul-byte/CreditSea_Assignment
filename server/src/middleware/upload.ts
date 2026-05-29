import fs from "fs";
import path from "path";
import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    !ALLOWED_MIME_TYPES.has(file.mimetype) &&
    !ALLOWED_EXTENSIONS.has(ext)
  ) {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"));
    return;
  }

  cb(null, true);
}

export const salarySlipUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export { UPLOAD_DIR };
