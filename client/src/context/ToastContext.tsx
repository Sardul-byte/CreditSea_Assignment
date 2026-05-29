"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { registerToastListener, type ToastItem, type ToastType } from "@/lib/toastBridge";

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 4500;

const STYLES: Record<ToastType, string> = {
  success:
    "border-emerald-200/80 bg-white/95 text-emerald-800 shadow-card backdrop-blur-sm",
  error:
    "border-red-200/80 bg-white/95 text-red-800 shadow-card backdrop-blur-sm",
  info: "border-brand-200/80 bg-white/95 text-brand-800 shadow-card backdrop-blur-sm",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const item: ToastItem = {
        id: crypto.randomUUID(),
        message,
        type,
      };
      setToasts((current) => [...current, item]);
      setTimeout(() => dismiss(item.id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (message: string) => addToast(message, "success"),
      error: (message: string) => addToast(message, "error"),
      info: (message: string) => addToast(message, "info"),
    }),
    [addToast]
  );

  useEffect(() => {
    return registerToastListener((toast) => {
      setToasts((current) => [...current, toast]);
      setTimeout(() => dismiss(toast.id), AUTO_DISMISS_MS);
    });
  }, [dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3.5 ${STYLES[toast.type]}`}
          >
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-sm opacity-70 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
