"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "@/lib/api";

export interface ApplyProgress {
  isEligible: boolean;
  hasSalarySlip: boolean;
  loading: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
}

const ApplyProgressContext = createContext<ApplyProgress | undefined>(undefined);

export function ApplyProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isEligible, setIsEligible] = useState(false);
  const [hasSalarySlip, setHasSalarySlip] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
    }

    try {
      const { data } = await api.get<{
        applyStep: number;
        isEligible: boolean;
        hasSalarySlip: boolean;
      }>("/api/borrower/apply-status");

      setIsEligible(Boolean(data.isEligible));
      setHasSalarySlip(Boolean(data.hasSalarySlip));
    } catch {
      setIsEligible(false);
      setHasSalarySlip(false);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ isEligible, hasSalarySlip, loading, refresh }),
    [isEligible, hasSalarySlip, loading, refresh]
  );

  return (
    <ApplyProgressContext.Provider value={value}>
      {children}
    </ApplyProgressContext.Provider>
  );
}

export function useApplyProgress(): ApplyProgress {
  const context = useContext(ApplyProgressContext);
  if (!context) {
    throw new Error("useApplyProgress must be used within ApplyProgressProvider");
  }
  return context;
}
