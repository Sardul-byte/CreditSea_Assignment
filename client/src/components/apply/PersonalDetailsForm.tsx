"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useApplyProgress } from "@/context/ApplyProgressContext";
import { CardSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";

type EmploymentMode = "salaried" | "self-employed" | "unemployed";

interface BreResponse {
  bre?: { passed: boolean; reason?: string };
}

const INELIGIBLE_HEADING = "You are not eligible for a loan";

const EMPLOYMENT_OPTIONS: { label: string; value: EmploymentMode }[] = [
  { label: "Salaried", value: "salaried" },
  { label: "Self-Employed", value: "self-employed" },
  { label: "Unemployed", value: "unemployed" },
];

function IneligibleAlert({ message }: { message: string }) {
  return (
    <div className="alert-error" role="alert" aria-live="assertive">
      <p className="font-semibold text-red-900">{INELIGIBLE_HEADING}</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
    </div>
  );
}

interface PersonalDetailsFormProps {
  isNewApplication?: boolean;
}

export function PersonalDetailsForm({
  isNewApplication = false,
}: PersonalDetailsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useApplyProgress();
  const errorRef = useRef<HTMLDivElement>(null);
  const [starting, setStarting] = useState(isNewApplication);
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [dob, setDob] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [employmentMode, setEmploymentMode] =
    useState<EmploymentMode>("salaried");
  const [loading, setLoading] = useState(false);
  const [breFailed, setBreFailed] = useState<string | null>(null);
  const [brePassed, setBrePassed] = useState(false);

  useEffect(() => {
    if (!isNewApplication) return;

    let cancelled = false;

    (async () => {
      try {
        await api.post("/api/borrower/start-application");
        if (!cancelled) await refresh();
        if (!cancelled) router.replace("/apply/personal-details");
      } catch {
        if (!cancelled) {
          toast.error("Could not start a new application. Please try again.");
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNewApplication, refresh, router, toast]);

  useEffect(() => {
    if (starting) return;

    let cancelled = false;

    (async () => {
      try {
        const { data } = await api.get<{
          profile?: {
            name: string;
            pan: string;
            dob: string;
            monthlyIncome: number;
            employmentMode: EmploymentMode;
          };
        }>("/api/borrower/apply-status");

        if (cancelled || !data.profile) return;

        setName(data.profile.name ?? "");
        setPan(data.profile.pan ?? "");
        setDob(data.profile.dob ?? "");
        setMonthlyIncome(String(data.profile.monthlyIncome ?? ""));
        setEmploymentMode(data.profile.employmentMode ?? "salaried");
      } catch {
        // Non-blocking — user can still fill the form manually
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [starting]);

  useEffect(() => {
    if (breFailed && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [breFailed]);

  function clearEligibilityError() {
    if (breFailed) setBreFailed(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setBreFailed(null);
    setBrePassed(false);

    try {
      const { data } = await api.post<BreResponse>("/api/borrower/profile", {
        name: name.trim(),
        pan: pan.trim().toUpperCase(),
        dob,
        monthlyIncome: Number(monthlyIncome),
        employmentMode,
      });

      if (!data.bre?.passed) {
        const reason =
          data.bre?.reason ??
          "Your profile does not meet our eligibility requirements.";
        setBreFailed(reason);
        toast.error(INELIGIBLE_HEADING);
        await refresh({ silent: true });
        return;
      }

      setBrePassed(true);
      toast.success("Eligibility confirmed — proceed to salary slip");
      await refresh({ silent: true });
      setTimeout(() => router.push("/apply/salary-slip"), 1200);
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Your profile does not meet our eligibility requirements."
      );
      setBreFailed(message);
    } finally {
      setLoading(false);
    }
  }

  if (starting) {
    return <CardSkeleton />;
  }

  return (
    <div className="surface-card animate-fade-in">
      <h2 className="text-xl font-bold tracking-tight text-slate-900">Personal details</h2>
      <p className="mt-1.5 text-sm text-slate-500">
        We&apos;ll verify your eligibility before you continue.
      </p>

      {breFailed && (
        <div ref={errorRef} className="mt-6">
          <IneligibleAlert message={breFailed} />
        </div>
      )}

      {brePassed && (
        <div className="alert-success">
          <p className="font-semibold text-emerald-800">You&apos;re eligible!</p>
          <p className="mt-1 text-sm text-emerald-700">
            Redirecting to salary slip upload…
          </p>
        </div>
      )}

      {!brePassed && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearEligibilityError();
              }}
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="pan"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              PAN
            </label>
            <input
              id="pan"
              type="text"
              required
              maxLength={10}
              value={pan}
              onChange={(e) => {
                setPan(e.target.value.toUpperCase());
                clearEligibilityError();
              }}
              placeholder="ABCDE1234F"
              className="input-field uppercase"
            />
          </div>

          <div>
            <label
              htmlFor="dob"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              required
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                clearEligibilityError();
              }}
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="monthlyIncome"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Monthly salary (₹)
            </label>
            <input
              id="monthlyIncome"
              type="number"
              required
              min={0}
              value={monthlyIncome}
              onChange={(e) => {
                setMonthlyIncome(e.target.value);
                clearEligibilityError();
              }}
              className="input-field"
            />
          </div>

          <div>
            <label
              htmlFor="employmentMode"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Employment mode
            </label>
            <select
              id="employmentMode"
              required
              value={employmentMode}
              onChange={(e) => {
                setEmploymentMode(e.target.value as EmploymentMode);
                clearEligibilityError();
              }}
              className="input-field"
            >
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {breFailed && <IneligibleAlert message={breFailed} />}

          <button
            type="submit"
            disabled={loading || brePassed}
            className="btn-primary w-full !py-3"
          >
            {loading
              ? "Checking eligibility…"
              : breFailed
                ? "Check eligibility again"
                : "Submit & check eligibility"}
          </button>
        </form>
      )}
    </div>
  );
}
