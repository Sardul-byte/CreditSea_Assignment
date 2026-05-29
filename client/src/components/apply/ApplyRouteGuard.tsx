"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApplyProgress } from "@/context/ApplyProgressContext";
import { CardSkeleton } from "@/components/ui/Skeleton";

const GUARDED_PATHS = {
  salarySlip: "/apply/salary-slip",
  loanConfig: "/apply/loan-config",
} as const;

export function ApplyRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isEligible, hasSalarySlip, loading } = useApplyProgress();

  const onSalarySlip = pathname.startsWith(GUARDED_PATHS.salarySlip);
  const onLoanConfig = pathname.startsWith(GUARDED_PATHS.loanConfig);
  const isGuardedRoute = onSalarySlip || onLoanConfig;

  const blocked =
    onSalarySlip && !isEligible
      ? "personal-details"
      : onLoanConfig && !isEligible
        ? "personal-details"
        : onLoanConfig && !hasSalarySlip
          ? "salary-slip"
          : null;

  useEffect(() => {
    if (!isGuardedRoute || loading || !blocked) return;

    if (blocked === "personal-details") {
      router.replace("/apply/personal-details");
      return;
    }

    router.replace("/apply/salary-slip");
  }, [blocked, isGuardedRoute, loading, router]);

  if (!isGuardedRoute) {
    return <>{children}</>;
  }

  if (loading || blocked) {
    return <CardSkeleton />;
  }

  return <>{children}</>;
}
