import { ApplyShell } from "@/components/apply/ApplyShell";
import { ApplyProgressProvider } from "@/context/ApplyProgressContext";

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApplyProgressProvider>
      <ApplyShell>{children}</ApplyShell>
    </ApplyProgressProvider>
  );
}
