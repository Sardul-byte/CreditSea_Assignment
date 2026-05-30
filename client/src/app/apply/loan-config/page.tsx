"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApplyProgress } from "@/context/ApplyProgressContext";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import {
  calculateSimpleInterest,
  calculateTotalRepayment,
  formatINR,
  LOAN_AMOUNT_MAX,
  LOAN_AMOUNT_MIN,
  LOAN_AMOUNT_STEP,
  INTEREST_RATE_ANNUAL,
  TENURE_MAX_DAYS,
  TENURE_MIN_DAYS,
} from "@/lib/loan";

const INELIGIBLE_HEADING = "You are not eligible for a loan";

export default function LoanConfigPage() {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useApplyProgress();
  const errorRef = useRef<HTMLDivElement>(null);
  const [loanAmount, setLoanAmount] = useState(100_000);
  const [tenureInDays, setTenureInDays] = useState(180);
  const [loading, setLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const simpleInterest = useMemo(
    () => calculateSimpleInterest(loanAmount, tenureInDays),
    [loanAmount, tenureInDays]
  );

  const totalRepayment = useMemo(
    () => calculateTotalRepayment(loanAmount, tenureInDays),
    [loanAmount, tenureInDays]
  );

  async function handleApply() {
    setLoading(true);
    setApplyError(null);

    try {
      await api.post("/api/borrower/apply", { loanAmount, tenureInDays });
      toast.success("Loan applied successfully");
      setSuccess(true);
      await refresh({ silent: true });
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "You are not eligible to apply for a loan."
      );
      setApplyError(message);
      toast.error(INELIGIBLE_HEADING);
      errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setLoading(false);
    }
  }

  return (
    <div className="surface-card animate-fade-in">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Loan configuration</h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Choose your loan amount and tenure. Totals update live.
      </p>

      {applyError && (
        <div ref={errorRef} className="alert-error mt-6" role="alert" aria-live="assertive">
          <p className="font-semibold text-red-900">{INELIGIBLE_HEADING}</p>
          <p className="mt-1 text-sm text-red-700">{applyError}</p>
          <Link
            href="/apply/personal-details"
            className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Update personal details and check eligibility again →
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-10">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label htmlFor="loanAmount" className="text-sm font-medium text-gray-700">
              Loan amount
            </label>
            <span className="text-sm font-bold text-brand-600">
              {formatINR(loanAmount)}
            </span>
          </div>
          <input
            id="loanAmount"
            type="range"
            min={LOAN_AMOUNT_MIN}
            max={LOAN_AMOUNT_MAX}
            step={LOAN_AMOUNT_STEP}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="h-4 w-full cursor-pointer touch-manipulation accent-brand-600 sm:h-3"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{formatINR(LOAN_AMOUNT_MIN)}</span>
            <span>{formatINR(LOAN_AMOUNT_MAX)}</span>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <label htmlFor="tenure" className="text-sm font-medium text-gray-700">
              Tenure
            </label>
            <span className="text-sm font-bold text-brand-600">
              {tenureInDays} days
            </span>
          </div>
          <input
            id="tenure"
            type="range"
            min={TENURE_MIN_DAYS}
            max={TENURE_MAX_DAYS}
            step={1}
            value={tenureInDays}
            onChange={(e) => setTenureInDays(Number(e.target.value))}
            className="h-4 w-full cursor-pointer touch-manipulation accent-brand-600 sm:h-3"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{TENURE_MIN_DAYS} days</span>
            <span>{TENURE_MAX_DAYS} days</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white p-5 sm:p-6">
        <h3 className="text-sm font-bold text-slate-900">Repayment summary</h3>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Principal</dt>
            <dd className="font-medium text-gray-900">{formatINR(loanAmount)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Interest rate</dt>
            <dd className="font-medium text-gray-900">
              {INTEREST_RATE_ANNUAL}% p.a.
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Tenure</dt>
            <dd className="font-medium text-gray-900">{tenureInDays} days</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-blue-100 pt-3">
            <dt className="text-gray-600">Simple interest</dt>
            <dd className="font-medium text-gray-900">
              {formatINR(simpleInterest)}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="font-semibold text-gray-900">Total repayment</dt>
            <dd className="text-lg font-bold text-brand-700">
              {formatINR(totalRepayment)}
            </dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={loading}
        className="btn-primary mt-8 w-full !py-3.5"
      >
        {loading ? "Submitting…" : "Apply for loan"}
      </button>

      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100/50">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">
              Loan applied successfully
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Your application has been received and is currently under review.
            </p>
            <div className="mt-6">
              <Link
                href="/apply"
                className="btn-primary w-full py-2.5 active:scale-[0.97]"
              >
                OK
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
