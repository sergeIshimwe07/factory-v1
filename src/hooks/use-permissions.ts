"use client";

import { useAuthStore } from "@/lib/auth";
import { hasPermission, getAccessibleModules } from "@/lib/permissions";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  return {
    can: (module: string, action: string) => hasPermission(user?.role, module, action),
    canView: (module: string) => hasPermission(user?.role, module, "view"),
    canCreate: (module: string) => hasPermission(user?.role, module, "create"),
    canEdit: (module: string) => hasPermission(user?.role, module, "edit"),
    canDelete: (module: string) => hasPermission(user?.role, module, "delete"),
    accessibleModules: getAccessibleModules(user?.role),
    role: user?.role,
  };
}
