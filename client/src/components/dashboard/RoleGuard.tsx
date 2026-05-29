"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  canAccessModule,
  getFirstDashboardPath,
  isExecutiveRole,
  type DashboardModule,
} from "@/lib/dashboard";

interface RoleGuardProps {
  module: DashboardModule;
  children: React.ReactNode;
}

export function RoleGuard({ module, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "borrower") {
      router.replace("/apply");
      return;
    }

    if (!isExecutiveRole(user.role)) {
      router.replace("/login");
      return;
    }

    if (!canAccessModule(user.role, module)) {
      router.replace(getFirstDashboardPath(user.role));
    }
  }, [user, isLoading, module, router]);

  if (
    isLoading ||
    !user ||
    user.role === "borrower" ||
    !canAccessModule(user.role, module)
  ) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
