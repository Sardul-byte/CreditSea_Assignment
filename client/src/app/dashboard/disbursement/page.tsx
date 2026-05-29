"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { formatINR } from "@/lib/loan";

interface DisbursementApplication {
  _id: string;
  status: string;
  loanAmount: number;
  totalRepayment: number;
  updatedAt: string;
  borrower?: {
    name?: string;
    email?: string;
  };
}

export default function DisbursementDashboardPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<DisbursementApplication[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{
        applications: DisbursementApplication[];
      }>("/api/disbursement/applications");
      setApplications(data.applications ?? []);
    } catch {
      // Error toast via interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleDisburse(id: string) {
    const previous = applications;
    setApplications((apps) => apps.filter((a) => a._id !== id));
    setActionId(id);

    try {
      await api.patch(`/api/disbursement/applications/${id}/disburse`);
      toast.success("Loan marked as disbursed");
    } catch {
      setApplications(previous);
    } finally {
      setActionId(null);
    }
  }

  return (
    <RoleGuard module="disbursement">
      <div className="space-y-6">
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <TableSkeleton rows={4} cols={5} />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Disbursement
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Mark sanctioned loans as disbursed.
              </p>
            </div>

            {applications.length === 0 ? (
              <EmptyState message="No sanctioned loans waiting for disbursement." />
            ) : (
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3 font-medium">Borrower</th>
                          <th className="px-4 py-3 font-medium">Loan Amount</th>
                          <th className="px-4 py-3 font-medium">
                            Total Repayment
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Sanctioned Date
                          </th>
                          <th className="px-4 py-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app._id} className="border-b border-gray-100">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">
                                {app.borrower?.name ?? "—"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {app.borrower?.email}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {formatINR(app.loanAmount)}
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-700">
                              {formatINR(app.totalRepayment)}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(app.updatedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                disabled={actionId === app._id}
                                onClick={() => handleDisburse(app._id)}
                                className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                              >
                                {actionId === app._id
                                  ? "Processing…"
                                  : "Mark as Disbursed"}
                              </button>
                            </td>
                          </tr>
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
