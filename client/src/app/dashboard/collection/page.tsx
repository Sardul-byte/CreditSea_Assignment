"use client";

import { FormEvent, Fragment, useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/errors";
import { formatINR } from "@/lib/loan";

interface CollectionLoan {
  id: string;
  status: string;
  loanAmount: number;
  totalRepayment: number;
  totalPaid: number;
  outstandingBalance: number;
  borrower?: {
    name?: string;
    email?: string;
  };
}

const STATUS_STYLES: Record<string, string> = {
  disbursed: "bg-purple-100 text-purple-800",
  closed: "bg-green-100 text-green-800",
};

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CollectionDashboardPage() {
  const toast = useToast();
  const [loans, setLoans] = useState<CollectionLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [payLoanId, setPayLoanId] = useState<string | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [utrNumber, setUtrNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayInputValue());
  const [submitting, setSubmitting] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ loans: CollectionLoan[] }>(
        "/api/collection/loans"
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

  function openPaymentForm(loanId: string) {
    setPayLoanId(loanId);
    setUtrNumber("");
    setAmount("");
    setPaymentDate(todayInputValue());
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[loanId];
      return next;
    });
  }

  async function handlePayment(e: FormEvent, loan: CollectionLoan) {
    e.preventDefault();
    const paidAmount = Number(amount);

    if (paidAmount <= 0) {
      const msg = "Amount must be greater than zero.";
      setRowErrors((prev) => ({ ...prev, [loan.id]: msg }));
      toast.error(msg);
      return;
    }

    if (paidAmount > loan.outstandingBalance) {
      const msg = `Amount exceeds outstanding balance of ${formatINR(loan.outstandingBalance)}.`;
      setRowErrors((prev) => ({ ...prev, [loan.id]: msg }));
      toast.error(msg);
      return;
    }

    setSubmitting(true);
    setRowErrors((prev) => {
      const next = { ...prev };
      delete next[loan.id];
      return next;
    });

    const previous = loans;
    const newTotalPaid = loan.totalPaid + paidAmount;
    const newOutstanding = Math.max(loan.totalRepayment - newTotalPaid, 0);
    const newStatus = newOutstanding <= 0 ? "closed" : loan.status;

    setLoans((current) =>
      current.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              totalPaid: newTotalPaid,
              outstandingBalance: newOutstanding,
              status: newStatus,
            }
          : l
      )
    );

    try {
      await api.post(
        `/api/collection/loans/${loan.id}/payment`,
        {
          utrNumber: utrNumber.trim(),
          amount: paidAmount,
          date: paymentDate,
        },
        { headers: { "X-Skip-Toast": "1" } }
      );
      setPayLoanId(null);
      toast.success(
        newStatus === "closed"
          ? "Payment recorded — loan closed"
          : "Payment recorded"
      );
    } catch (err) {
      setLoans(previous);
      setRowErrors((prev) => ({
        ...prev,
        [loan.id]: getApiErrorMessage(err, "Payment failed."),
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RoleGuard module="collection">
      <div className="animate-fade-in space-y-6">
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <TableSkeleton rows={4} cols={7} />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Collection
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Record repayments on disbursed loans. UTR comes from the
                borrower&apos;s bank receipt.
              </p>
            </div>

            {loans.length === 0 ? (
              <EmptyState message="No disbursed loans yet." />
            ) : (
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3 font-medium">Borrower</th>
                          <th className="px-4 py-3 font-medium">Loan Amount</th>
                          <th className="px-4 py-3 font-medium">
                            Total Repayment
                          </th>
                          <th className="px-4 py-3 font-medium">Amount Paid</th>
                          <th className="px-4 py-3 font-medium">Outstanding</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((loan) => (
                          <Fragment key={loan.id}>
                            <tr className="border-b border-gray-100">
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">
                                  {loan.borrower?.name ?? "—"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {loan.borrower?.email}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                {formatINR(loan.loanAmount)}
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                {formatINR(loan.totalRepayment)}
                              </td>
                              <td className="px-4 py-3 text-gray-900">
                                {formatINR(loan.totalPaid)}
                              </td>
                              <td className="px-4 py-3 font-medium text-orange-700">
                                {formatINR(loan.outstandingBalance)}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                                    STATUS_STYLES[loan.status] ??
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {loan.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {loan.status !== "closed" &&
                                loan.outstandingBalance > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => openPaymentForm(loan.id)}
                                    className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                                  >
                                    Record Payment
                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">—</span>
                                )}
                              </td>
                            </tr>
                            {payLoanId === loan.id && (
                              <tr className="bg-gray-50">
                                <td colSpan={7} className="px-4 py-4">
                                  <form
                                    onSubmit={(e) => handlePayment(e, loan)}
                                    className="space-y-3"
                                  >
                                    {rowErrors[loan.id] && (
                                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {rowErrors[loan.id]}
                                      </p>
                                    )}
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                      <input
                                        type="text"
                                        required
                                        placeholder="UTR Number"
                                        value={utrNumber}
                                        onChange={(e) =>
                                          setUtrNumber(e.target.value)
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                      />
                                      <input
                                        type="number"
                                        required
                                        min={0.01}
                                        step={0.01}
                                        placeholder="Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                      />
                                      <input
                                        type="date"
                                        required
                                        value={paymentDate}
                                        onChange={(e) =>
                                          setPaymentDate(e.target.value)
                                        }
                                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          type="submit"
                                          disabled={submitting}
                                          className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                                        >
                                          {submitting ? "Saving…" : "Submit"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setPayLoanId(null)}
                                          className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}
