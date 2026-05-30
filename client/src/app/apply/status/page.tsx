"use client";

import Link from "next/link";

export default function StatusPage() {
  return (
    <div className="surface-card text-center animate-fade-in py-10 px-6 sm:py-14 sm:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-100/50">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
        Loan applied successfully
      </h2>
      <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed text-slate-500">
        Your loan application has been received and is currently under review. You can track its status inside your portal.
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          href="/apply"
          className="btn-primary px-8 py-3 shadow-md active:scale-[0.97]"
        >
          OK
        </Link>
      </div>
    </div>
  );
}
