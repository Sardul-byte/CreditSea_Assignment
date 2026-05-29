"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { ApplyRouteGuard } from "./ApplyRouteGuard";
import { StepIndicator } from "./StepIndicator";

const HUB_PATHS = ["/apply", "/apply/my-loans"];

export function ApplyShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  const isHub = HUB_PATHS.includes(pathname);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "borrower") {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "borrower") {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-brand-100" />
          <p className="text-sm font-medium text-slate-500">Loading portal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mesh-bg min-h-screen">
      <header className="glass-header sticky top-0 z-30">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <Logo href="/apply" size="sm" />
            <p className="text-xs font-medium text-slate-500">
              {isHub ? "Borrower Portal" : "Loan Application"}
            </p>
          </div>
          <button type="button" onClick={() => { logout(); router.push("/login"); }} className="btn-ghost">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <StepIndicator />
        <ApplyRouteGuard>{children}</ApplyRouteGuard>
      </main>
    </div>
  );
}
