import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-brand lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-shine opacity-30" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-64 w-64 rounded-full bg-indigo-300/10 blur-3xl" />

        <Logo href="/" variant="light" size="lg" />

        <div className="relative animate-fade-in">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-200">
            Premium lending platform
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-bold leading-tight text-white">
            Finance that moves at the speed of your ambitions
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-brand-100/90">
            Secure applications, instant eligibility checks, and transparent
            repayment — all in one place.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-brand-100">
            {[
              "12% fixed annual interest",
              "Loans from ₹50,000 to ₹5,00,000",
              "Real-time application tracking",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-xs text-white">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-brand-200/70">
          © {new Date().getFullYear()} CredSea. All rights reserved.
        </p>
      </div>

      <div className="mesh-bg flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
