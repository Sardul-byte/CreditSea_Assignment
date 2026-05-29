export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center">
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
