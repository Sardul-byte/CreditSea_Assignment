export type DashboardModule = "sales" | "sanction" | "disbursement" | "collection";

export interface DashboardNavItem {
  id: DashboardModule;
  label: string;
  href: string;
  roles: string[];
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    id: "sales",
    label: "Sales",
    href: "/dashboard/sales",
    roles: ["admin", "sales"],
  },
  {
    id: "sanction",
    label: "Sanction",
    href: "/dashboard/sanction",
    roles: ["admin", "sanction"],
  },
  {
    id: "disbursement",
    label: "Disbursement",
    href: "/dashboard/disbursement",
    roles: ["admin", "disbursement"],
  },
  {
    id: "collection",
    label: "Collection",
    href: "/dashboard/collection",
    roles: ["admin", "collection"],
  },
];

const EXECUTIVE_ROLES = new Set([
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
]);

export function isExecutiveRole(role: string): boolean {
  return EXECUTIVE_ROLES.has(role);
}

export function getNavItemsForRole(role: string): DashboardNavItem[] {
  return DASHBOARD_NAV.filter((item) => item.roles.includes(role));
}

export function canAccessModule(
  role: string,
  module: DashboardModule
): boolean {
  return getNavItemsForRole(role).some((item) => item.id === module);
}

export function getFirstDashboardPath(role: string): string {
  const items = getNavItemsForRole(role);
  return items[0]?.href ?? "/login";
}
