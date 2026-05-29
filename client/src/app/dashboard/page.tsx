"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getFirstDashboardPath } from "@/lib/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(getFirstDashboardPath(user.role));
  }, [user, isLoading, router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-sm text-gray-500">Redirecting…</p>
    </div>
  );
}
