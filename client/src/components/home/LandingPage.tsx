"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { getFirstDashboardPath } from "@/lib/dashboard";

const FEATURES = [
  {
    title: "Quick eligibility check",
    description:
      "Submit your profile and get an instant business rules evaluation before you apply.",
    icon: "✓",
  },
  {
    title: "Transparent pricing",
    description:
      "Fixed 12% p.a. simple interest with live repayment calculations before you commit.",
    icon: "₹",
  },
  {
    title: "End-to-end tracking",
    description:
      "Follow your application from submission through sanction, disbursement, and closure.",
    icon: "↗",
  },
  {
    title: "Secure document upload",
    description:
      "Upload salary slips safely and share them only with authorized reviewers.",
    icon: "Doc",
  },
];

const STEPS = [
  { step: "01", title: "Create account", text: "Register as a borrower in minutes." },
  { step: "02", title: "Complete profile", text: "Verify eligibility with your details." },
  { step: "03", title: "Configure loan", text: "Choose amount and tenure with live totals." },
  { step: "04", title: "Track status", text: "Monitor progress until funds are disbursed." },
];

export function LandingPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const primaryHref = user
    ? user.role === "borrower"
      ? "/apply"
      : getFirstDashboardPath(user.role)
    : "/signup";

  const primaryLabel = user
    ? user.role === "borrower"
      ? "Continue application"
      : "Open dashboard"
    : "Apply for a loan";

  return (
    <div className="min-h-screen bg-white">
      <header className="glass-header sticky top-0 z-40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-brand-600">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-brand-600">
              How it works
            </a>
            <a href="#for-teams" className="transition hover:text-brand-600">
              For teams
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoading && user ? (
              <>
                <Link
                  href={primaryHref}
                  className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 sm:px-4"
                >
                  {user.role === "borrower" ? "Apply" : "Dashboard"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.refresh();
                  }}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden mesh-bg">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                Loan Management Platform
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Smart lending, from application to repayment
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                CredSea helps borrowers apply with confidence and gives your
                sales, sanction, disbursement, and collection teams a single
                place to manage every stage of the loan lifecycle.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={primaryHref}
                  className="btn-primary px-6 py-3"
                >
                  {primaryLabel}
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  Executive login
                </Link>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-200 pt-8">
                <div>
                  <dt className="text-2xl font-bold text-slate-900">12%</dt>
                  <dd className="text-xs text-slate-500">Fixed p.a. rate</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-slate-900">₹50K+</dt>
                  <dd className="text-xs text-slate-500">Min. loan amount</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-slate-900">4</dt>
                  <dd className="text-xs text-slate-500">Workflow stages</dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div className="surface-card !shadow-glow">
                <p className="text-sm font-medium text-slate-500">
                  Sample repayment
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  ₹1,05,918
                </p>
                <p className="text-sm text-slate-500">Total on ₹1,00,000 · 180 days</p>
                <div className="mt-6 space-y-3">
                  {[
                    { label: "Principal", value: "₹1,00,000" },
                    { label: "Interest (12% p.a.)", value: "₹5,918" },
                    { label: "Status", value: "Applied → Sanctioned → Disbursed" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm"
                    >
                      <span className="text-slate-600">{row.label}</span>
                      <span className="font-medium text-slate-900">{row.value}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signup"
                  className="mt-6 block w-full rounded-lg bg-slate-900 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Start your application
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Built for borrowers and operations teams
            </h2>
            <p className="mt-3 text-slate-600">
              Everything you need to originate, review, and service personal
              loans in one streamlined platform.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-slate-100 bg-slate-50 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            Borrowers complete a guided four-step flow. Each step saves progress
            and keeps eligibility checks server-side.
          </p>
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item) => (
              <li
                key={item.step}
                className="relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <span className="text-3xl font-bold text-brand-100">
                  {item.step}
                </span>
                <h3 className="mt-2 font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Create borrower account
            </Link>
          </div>
        </div>
      </section>

      {/* For teams */}
      <section id="for-teams" className="border-t border-slate-100 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-brand px-6 py-12 text-white shadow-glow sm:px-10 sm:py-14">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Role-based dashboards for your team
                </h2>
                <p className="mt-4 text-slate-300">
                  Sales, sanction, disbursement, and collection each get a
                  focused workspace. Admins can access every module from one
                  sidebar.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {["Sales", "Sanction", "Disbursement", "Collection"].map(
                  (role) => (
                    <div
                      key={role}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-3 font-medium"
                    >
                      {role}
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Team login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                New borrower? Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} CredSea Loan Management System
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-600">
            <Link href="/login" className="hover:text-brand-600">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-brand-600">
              Sign up
            </Link>
            <Link href="/apply" className="hover:text-brand-600">
              Apply
            </Link>
            <Link href="/dashboard" className="hover:text-brand-600">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
