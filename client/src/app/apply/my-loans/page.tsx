"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { NEW_LOAN_PATH } from "@/lib/apply";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { formatINR } from "@/lib/loan";

interface Loan {
  _id: string;
  status: string;
  loanAmount: number;
  tenureInDays: number;
  interestRate: number;
  totalRepayment: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id: string;
  utrNumber: string;
  amount: number;
  date: string;
}

interface LoanWithPayments {
  loan: Loan;
  payments: Payment[];
}

const STATUS_STYLES: Record<string, string> = {
  applied: "bg-yellow-100 text-yellow-800",
  sanctioned: "bg-blue-100 text-blue-800",
  disbursed: "bg-purple-100 text-purple-800",
  closed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

function LoanCard({ loan, payments }: LoanWithPayments) {
  const showPayments =
    loan.status === "disbursed" || loan.status === "closed";

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = Math.max(loan.totalRepayment - totalPaid, 0);

  return (
    <div className="surface-card overflow-hidden !p-0">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {formatINR(loan.loanAmount)} · {loan.tenureInDays} days
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Applied on{" "}
              {new Date(loan.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        {loan.status === "rejected" && loan.rejectionReason && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {loan.rejectionReason}
          </p>
        )}

        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500">Interest rate</dt>
            <dd className="text-sm font-medium text-gray-900">
              {loan.interestRate}% p.a.
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Total repayment</dt>
            <dd className="text-sm font-semibold text-blue-700">
              {formatINR(loan.totalRepayment)}
            </dd>
          </div>
          {showPayments && (
            <>
              <div>
                <dt className="text-xs text-gray-500">Total paid</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {formatINR(totalPaid)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Outstanding balance</dt>
                <dd className="text-sm font-medium text-orange-700">
                  {formatINR(outstanding)}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>

      {showPayments && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 sm:px-6">
            <h4 className="text-sm font-semibold text-gray-900">
              Payment history
            </h4>
          </div>
          {payments.length === 0 ? (
            <p className="px-4 pb-6 text-center text-sm text-gray-500 sm:px-6">
              No payments recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-y border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
                    <th className="px-4 py-3 font-medium sm:px-6">Date</th>
                    <th className="px-4 py-3 font-medium sm:px-6">UTR</th>
                    <th className="px-4 py-3 text-right font-medium sm:px-6">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-gray-900 sm:px-6">
                        {new Date(payment.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-mono text-gray-700 sm:px-6">
                        {payment.utrNumber}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 sm:px-6">
                        {formatINR(payment.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyLoansPage() {
  const [loans, setLoans] = useState<LoanWithPayments[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ loans: LoanWithPayments[] }>(
        "/api/borrower/my-loans"
      );

      setLoans(data.loans ?? []);
    } catch {
      // Error toast via interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  if (loading) {
    return <CardSkeleton />;
  }

  if (loans.length === 0) {
    return (
      <div className="surface-card text-center">
        <h2 className="text-xl font-semibold text-gray-900">No loans yet</h2>
        <p className="mt-2 text-sm text-gray-600">
          You haven&apos;t submitted a loan application. Start one when
          you&apos;re ready.
        </p>
        <Link
          href={NEW_LOAN_PATH}
          className="btn-primary mt-6"
        >
          Apply for a loan
        </Link>
        <Link
          href="/apply"
          className="mt-3 block text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to portal
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/apply"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to portal
        </Link>
        <Link
          href={NEW_LOAN_PATH}
          className="btn-secondary"
        >
          Apply for new loan
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">My loans</h2>
        <p className="mt-1 text-sm text-gray-600">
          {loans.length} application{loans.length === 1 ? "" : "s"} on record
        </p>
      </div>

      <div className="space-y-4">
        {loans.map(({ loan, payments }) => (
          <LoanCard key={loan._id} loan={loan} payments={payments} />
        ))}
      </div>
    </div>
  );
}
