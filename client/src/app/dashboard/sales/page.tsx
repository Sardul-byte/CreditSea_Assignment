"use client";

import { useCallback, useEffect, useState } from "react";
import { RoleGuard } from "@/components/dashboard/RoleGuard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";

interface Lead {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function SalesDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ leads: Lead[] }>("/api/sales/leads");
      setLeads(data.leads ?? []);
    } catch {
      // Error toast via interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <RoleGuard module="sales">
      <div className="animate-fade-in space-y-6">
        {loading ? (
          <>
            <PageHeaderSkeleton />
            <TableSkeleton rows={5} cols={4} />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                Sales
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Borrowers who have not submitted a loan application yet.
              </p>
            </div>

            {leads.length === 0 ? (
              <EmptyState message="No leads found. All registered borrowers have already applied." />
            ) : (
              <div className="-mx-4 overflow-x-auto sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-4 py-3 font-medium">Name</th>
                          <th className="px-4 py-3 font-medium">Email</th>
                          <th className="px-4 py-3 font-medium">
                            Registered On
                          </th>
                          <th className="px-4 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leads.map((lead) => (
                          <tr key={lead.id} className="border-b border-gray-100">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {lead.name}
                            </td>
                            <td className="px-4 py-3 text-gray-700">
                              {lead.email}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(lead.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                No Application Yet
                              </span>
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
