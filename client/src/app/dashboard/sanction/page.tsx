"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Modal } from "@/components/dashboard/Modal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { getUploadUrl } from "@/lib/apiUrl";
import { formatINR } from "@/lib/loan";

interface SanctionApplication {
  id: string;
  status: string;
  loanAmount: number;
  tenureInDays: number;
  totalRepayment: number;
  salarySlipUrl?: string;
  borrower: {
    name?: string;
    pan?: string;
    income?: number;
  } | null;
}

export default function SanctionDashboardPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<SanctionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<SanctionApplication | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ applications: SanctionApplication[] }>(
        "/api/sanction/applications"
      );
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

  async function handleApprove(id: string) {
    const previous = applications;
    setApplications((apps) => apps.filter((a) => a.id !== id));
    setActionId(id);

    try {
      await api.patch(`/api/sanction/applications/${id}/approve`);
      toast.success("Application approved");
    } catch {
      setApplications(previous);
    } finally {
      setActionId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    const id = rejectTarget.id;
    const previous = applications;
    setApplications((apps) => apps.filter((a) => a.id !== id));
    setActionId(id);

    try {
      await api.patch(`/api/sanction/applications/${id}/reject`, {
        rejectionReason: rejectReason.trim(),
      });
      toast.success("Application rejected");
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      setApplications(previous);
    } finally {
      setActionId(null);
    }
  }

  return (
    <RoleGuard module="sanction">
      <div className="animate-fade-in space-y-6">
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <TableSkeleton rows={4} cols={8} />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Sanction
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Review and approve or reject applied loan requests.
              </p>
            </div>

            {applications.length === 0 ? (
              <EmptyState message="No applications in the applied queue." />
            ) : (
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[900px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3 font-medium">
                            Borrower Name
                          </th>
                          <th className="px-4 py-3 font-medium">PAN</th>
                          <th className="px-4 py-3 font-medium">Income</th>
                          <th className="px-4 py-3 font-medium">
                            Loan Amount
                          </th>
                          <th className="px-4 py-3 font-medium">Tenure</th>
                          <th className="px-4 py-3 font-medium">
                            Total Repayment
                          </th>
                          <th className="px-4 py-3 font-medium">
                            Salary Slip
                          </th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {app.borrower?.name ?? "—"}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-700">
                              {app.borrower?.pan ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {app.borrower?.income != null
                                ? formatINR(app.borrower.income)
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-gray-900">
                              {formatINR(app.loanAmount)}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {app.tenureInDays} days
                            </td>
                            <td className="px-4 py-3 font-medium text-blue-700">
                              {formatINR(app.totalRepayment)}
                            </td>
                            <td className="px-4 py-3">
                              {app.salarySlipUrl ? (
                                <a
                                  href={getUploadUrl(app.salarySlipUrl) ?? "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={actionId === app.id}
                                  onClick={() => handleApprove(app.id)}
                                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={actionId === app.id}
                                  onClick={() => {
                                    setRejectTarget(app);
                                    setRejectReason("");
                                  }}
                                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </div>
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

      <Modal
        open={rejectTarget !== null}
        title="Reject application"
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
      >
        <p className="text-sm text-gray-600">
          Rejecting application for{" "}
          <strong>{rejectTarget?.borrower?.name ?? "borrower"}</strong>.
        </p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Rejection reason"
          rows={3}
          className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setRejectTarget(null);
              setRejectReason("");
            }}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={actionId === rejectTarget?.id}
            onClick={handleReject}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {actionId === rejectTarget?.id ? "Rejecting…" : "Confirm reject"}
          </button>
        </div>
      </Modal>
    </RoleGuard>
  );
}
