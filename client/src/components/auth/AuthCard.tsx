import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: {
    text: string;
    linkText: string;
    href: string;
  };
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full">
      <div className="mb-8 lg:hidden">
        <Logo size="md" />
      </div>

      <div className="surface-card !p-8 sm:!p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {footer && (
          <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
            {footer.text}{" "}
            <Link
              href={footer.href}
              className="font-semibold text-brand-600 transition hover:text-brand-700"
            >
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
