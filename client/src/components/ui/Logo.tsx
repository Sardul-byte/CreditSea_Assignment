import Link from "next/link";

interface LogoProps {
  href?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { icon: "h-8 w-8 text-xs", text: "text-base" },
  md: { icon: "h-9 w-9 text-sm", text: "text-lg" },
  lg: { icon: "h-11 w-11 text-base", text: "text-xl" },
};

export function Logo({
  href = "/",
  variant = "dark",
  size = "md",
}: LogoProps) {
  const s = SIZES[size];
  const textClass =
    variant === "light" ? "text-white" : "text-slate-900";

  const content = (
    <span className="flex items-center gap-2.5">
      <span
        className={`${s.icon} flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white shadow-md shadow-brand-600/25`}
      >
        CS
      </span>
      <span className={`${s.text} font-bold tracking-tight ${textClass}`}>
        CredSea
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="transition opacity-100 hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
