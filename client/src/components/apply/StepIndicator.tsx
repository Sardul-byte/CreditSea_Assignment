"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApplyProgress } from "@/context/ApplyProgressContext";

const STEPS = [
  { label: "Personal Details", path: "/apply/personal-details" },
  { label: "Salary Slip", path: "/apply/salary-slip" },
  { label: "Loan Config", path: "/apply/loan-config" },
] as const;

const HIDE_PATHS = ["/apply", "/apply/my-loans", "/apply/status"];

function isStepComplete(
  index: number,
  isEligible: boolean,
  hasSalarySlip: boolean
): boolean {
  if (index === 0) return isEligible;
  if (index === 1) return hasSalarySlip;
  return false;
}

function canAccessStep(
  index: number,
  isEligible: boolean,
  hasSalarySlip: boolean
): boolean {
  if (index === 0) return true;
  if (index === 1) return isEligible;
  return isEligible && hasSalarySlip;
}

export function StepIndicator() {
  const pathname = usePathname();
  const { isEligible, hasSalarySlip, loading } = useApplyProgress();

  if (HIDE_PATHS.some((p) => pathname === p)) {
    return null;
  }

  const currentIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <nav aria-label="Application progress" className="mb-8 animate-fade-in">
      <div className="mb-5">
        <Link href="/apply" className="btn-ghost !px-0 text-brand-600 hover:!bg-transparent hover:text-brand-700">
          ← Back to portal
        </Link>
      </div>

      <div className="surface-card !p-4 sm:!p-5">
        <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isComplete = isStepComplete(index, isEligible, hasSalarySlip);
            const prevComplete =
              index > 0
                ? isStepComplete(index - 1, isEligible, hasSalarySlip)
                : false;
            const isAccessible =
              !loading && canAccessStep(index, isEligible, hasSalarySlip);

            const stepClassName = `flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              isActive
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : isComplete
                  ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                  : isAccessible
                    ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    : "cursor-not-allowed bg-slate-50 text-slate-400"
            }`;

            const badgeClassName = `flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              isActive
                ? "bg-white text-brand-600"
                : isComplete
                  ? "bg-brand-600 text-white"
                  : isAccessible
                    ? "bg-white text-slate-500 ring-1 ring-slate-200"
                    : "bg-slate-100 text-slate-400"
            }`;

            const content = (
              <>
                <span className={badgeClassName}>
                  {isComplete && !isActive ? "✓" : index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </>
            );

            return (
              <li key={step.path} className="flex items-center gap-2 sm:gap-3">
                {index > 0 && (
                  <span
                    className={`hidden h-px w-8 sm:block ${
                      prevComplete
                        ? "bg-gradient-to-r from-brand-400 to-brand-600"
                        : "bg-slate-200"
                    }`}
                  />
                )}
                {isAccessible ? (
                  <Link href={step.path} className={stepClassName}>
                    {content}
                  </Link>
                ) : (
                  <span
                    className={stepClassName}
                    aria-disabled="true"
                    title={
                      index === 1
                        ? "Complete personal details and pass eligibility first"
                        : "Upload your salary slip first"
                    }
                  >
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
