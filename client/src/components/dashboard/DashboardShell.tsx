"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { getNavItemsForRole, isExecutiveRole } from "@/lib/dashboard";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user ? getNavItemsForRole(user.role) : [];

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
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading || !user || !isExecutiveRole(user.role)) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center">
        <p className="text-sm font-medium text-slate-500">Loading dashboard…</p>
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <Logo href="/dashboard" variant="light" size="sm" />
        <p className="mt-3 inline-flex rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-brand-100">
          {user.role}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/15 text-white shadow-inner-soft ring-1 ring-white/10"
                  : "text-brand-100/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-brand-50 transition hover:bg-white/10"
        >
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-gradient-brand shadow-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-header sticky top-0 z-30 flex items-center gap-4 px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-900">
            {navItems.find((i) => pathname.startsWith(i.href))?.label ?? "Dashboard"}
          </span>
        </header>

        <main className="mesh-bg mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
