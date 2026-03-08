"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { PageLoader } from "@/components/ui/spinner";
import { PermissionDenied } from "@/components/ui/error-display";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module?: string;
  action?: string;
}

const moduleFromPath: Record<string, string> = {
  // "/dashboard": "dashboard",
  // "/sales": "sales",
  "/inventory": "inventory",
  "/production": "production",
  "/customers": "customers",
  "/suppliers": "suppliers",
  "/commissions": "commissions",
  "/accounting": "accounting",
  "/reports": "reports",
  "/users": "users",
};

function getModuleFromPath(pathname: string): string | undefined {
  for (const [path, mod] of Object.entries(moduleFromPath)) {
    if (pathname.startsWith(path)) return mod;
  }
  return undefined;
}

export function ProtectedRoute({ children, module, action = "view" }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <PageLoader />;
  }

  const targetModule = module || getModuleFromPath(pathname);
  if (targetModule && !hasPermission(user.role, targetModule, action)) {
    return <PermissionDenied />;
  }

  return <>{children}</>;
}
