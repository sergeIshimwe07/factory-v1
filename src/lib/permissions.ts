import type { Role } from "@/types";

// Module-level permissions map
export const rolePermissions: Record<Role, Record<string, string[]>> = {
  admin: {
    dashboard: ["view"],
    sales: ["view", "create", "edit", "delete"],
    inventory: ["view", "create", "edit", "delete"],
    production: ["view", "create", "edit", "delete"],
    customers: ["view", "create", "edit", "delete"],
    suppliers: ["view", "create", "edit", "delete"],
    commissions: ["view", "create", "edit", "delete"],
    accounting: ["view", "create", "edit", "delete"],
    reports: ["view"],
    users: ["view", "create", "edit", "delete"],
  },
  manager: {
    dashboard: ["view"],
    sales: ["view", "create", "edit"],
    inventory: ["view", "create", "edit"],
    production: ["view", "create", "edit"],
    customers: ["view", "create", "edit"],
    suppliers: ["view", "create", "edit"],
    commissions: ["view", "create", "edit"],
    accounting: ["view"],
    reports: ["view"],
    users: ["view"],
  },
  accountant: {
    dashboard: ["view"],
    sales: ["view"],
    inventory: ["view"],
    customers: ["view"],
    commissions: ["view"],
    accounting: ["view", "create", "edit"],
    reports: ["view"],
  },
  sales_agent: {
    dashboard: ["view"],
    sales: ["view", "create"],
    customers: ["view"],
    commissions: ["view"],
  },
  warehouse: {
    dashboard: ["view"],
    inventory: ["view", "create", "edit"],
    production: ["view", "create"],
  },
  production: {
    dashboard: ["view"],
    inventory: ["view"],
    production: ["view", "create", "edit"],
  },
};

export function hasPermission(role: Role | undefined, module: string, action: string): boolean {
  if (!role) return false;
  const perms = rolePermissions[role];
  if (!perms) return false;
  const modulePerms = perms[module];
  if (!modulePerms) return false;
  return modulePerms.includes(action);
}

export function getAccessibleModules(role: Role | undefined): string[] {
  if (!role) return [];
  const perms = rolePermissions[role];
  if (!perms) return [];
  return Object.keys(perms);
}

// Sidebar navigation items with permission requirements
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  module: string;
  children?: { label: string; href: string }[];
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", module: "dashboard" },
  {
    label: "Sales",
    href: "/sales",
    icon: "ShoppingCart",
    module: "sales",
    children: [
      { label: "All Sales", href: "/sales" },
      { label: "New Sale", href: "/sales/new" },
    ],
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: "Package",
    module: "inventory",
    children: [
      { label: "Products", href: "/inventory/products" },
      { label: "New Product", href: "/inventory/products/new" },
      { label: "Stock Movements", href: "/inventory/stock-movements" },
    ],
  },
  {
    label: "Production",
    href: "/production",
    icon: "Factory",
    module: "production",
    children: [
      { label: "Production Entries", href: "/production" },
      { label: "New Entry", href: "/production/new" },
      { label: "Bill of Materials", href: "/production/bom" },
    ],
  },
  {
    label: "Customers",
    href: "/customers",
    icon: "Users",
    module: "customers",
    children: [
      { label: "All Customers", href: "/customers" },
      { label: "New Customer", href: "/customers/new" },
    ],
  },
  {
    label: "Supply",
    href: "/suppliers",
    icon: "Truck",
    module: "suppliers",
    children: [
      { label: "Suppliers", href: "/supply/suppliers" },
      { label: "Supply Requests", href: "/suppliers/orders" },
      { label: "New Requests", href: "/suppliers/orders/new" },
    ],
  },
  {
    label: "Commissions",
    href: "/commissions",
    icon: "Percent",
    module: "commissions",
    children: [
      { label: "Overview", href: "/commissions" },
      { label: "Rules", href: "/commissions/rules" },
      { label: "Summary", href: "/commissions/summary" },
    ],
  },
  {
    label: "Accounting",
    href: "/accounting",
    icon: "Calculator",
    module: "accounting",
    children: [
      { label: "Journal", href: "/accounting/journal" },
      { label: "Accounts", href: "/accounting/accounts" },
      { label: "Reports", href: "/accounting/reports" },
    ],
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart3",
    module: "reports",
    children: [
      { label: "Commissions", href: "/reports/commissions" },
      { label: "Customers", href: "/reports/customers" },
      { label: "Inventory", href: "/reports/inventory" },
      { label: "Production", href: "/reports/production" },
      { label: "Sales", href: "/reports/sales" },
    ],
  },
  {
    label: "Users",
    href: "/users",
    icon: "UserCog",
    module: "users",
  },
];
