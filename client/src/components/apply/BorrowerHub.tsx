"use client";

import Link from "next/link";
import { NEW_LOAN_PATH } from "@/lib/apply";

export function BorrowerHub() {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-8 text-white shadow-glow sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="relative text-sm font-semibold uppercase tracking-widest text-brand-200">
          Welcome back
        </p>
        <h2 className="relative mt-2 text-2xl font-bold sm:text-3xl">
          Your borrower portal
        </h2>
        <p className="relative mt-3 max-w-lg text-sm leading-relaxed text-brand-100/90 sm:text-base">
          View existing applications or start a new loan with our guided,
          step-by-step process.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link href="/apply/my-loans" className="group surface-card-hover !p-7 sm:!p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-600 ring-1 ring-brand-100 transition group-hover:bg-brand-600 group-hover:text-white group-hover:ring-brand-600">
            ₹
          </span>
          <h3 className="mt-6 text-lg font-bold text-slate-900">
            My existing loans
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Check status, repayment details, and payment history for all your
            applications.
          </p>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2">
            View loans
            <span aria-hidden>→</span>
          </span>
        </Link>

        <Link href={NEW_LOAN_PATH} className="group surface-card-hover !p-7 sm:!p-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl font-light text-emerald-600 ring-1 ring-emerald-100 transition group-hover:bg-emerald-600 group-hover:text-white group-hover:ring-emerald-600">
            +
          </span>
          <h3 className="mt-6 text-lg font-bold text-slate-900">
            Apply for a new loan
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Complete your profile, upload documents, and submit a fresh
            application.
          </p>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 transition group-hover:gap-2">
            Start application
            <span aria-hidden>→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
