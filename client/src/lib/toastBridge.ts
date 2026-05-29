export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

type Listener = (toast: ToastItem) => void;

let listener: Listener | null = null;

export function registerToastListener(fn: Listener): () => void {
  listener = fn;
  return () => {
    listener = null;
  };
}

export function pushToast(message: string, type: ToastType): void {
  if (typeof window === "undefined") return;
  listener?.({
    id: crypto.randomUUID(),
    message,
    type,
  });
}
