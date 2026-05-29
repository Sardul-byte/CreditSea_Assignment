"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApplyProgress } from "@/context/ApplyProgressContext";
import api from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SalarySlipPage() {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useApplyProgress();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(selected: File | null) {
    if (!selected) {
      setFile(null);
      return;
    }

    const ext = selected.name.split(".").pop()?.toLowerCase();
    const allowedExt = ["pdf", "jpg", "jpeg", "png"];

    if (
      !ALLOWED_TYPES.includes(selected.type) &&
      (!ext || !allowedExt.includes(ext))
    ) {
      toast.error("Only PDF, JPG, and PNG files are allowed.");
      setFile(null);
      return;
    }

    if (selected.size > MAX_SIZE) {
      toast.error("File size must not exceed 5MB.");
      setFile(null);
      return;
    }

    setFile(selected);
    toast.info(`Selected ${selected.name}`);
  }

  async function handleUpload() {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("salarySlip", file);

      await api.post("/api/borrower/upload-salary-slip", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await refresh({ silent: true });
      toast.success("Salary slip uploaded");
      router.push("/apply/loan-config");
    } catch {
      // Error toast via interceptor
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="surface-card animate-fade-in">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Salary slip</h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Upload your latest salary slip (PDF, JPG, or PNG, max 5MB).
      </p>

      <div className="mt-6">
        <label
          htmlFor="salarySlip"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 transition hover:border-brand-300 hover:bg-brand-50/50"
        >
          <span className="text-sm font-medium text-gray-700">
            Tap to select a file
          </span>
          <span className="mt-1 text-xs text-gray-500">
            PDF, JPG, PNG · Max 5MB
          </span>
          <input
            id="salarySlip"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
        </label>

        {file && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="btn-primary mt-6 w-full !py-3"
      >
        {loading ? "Uploading…" : "Upload & continue"}
      </button>
    </div>
  );
}
