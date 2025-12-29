"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { UserRole } from "../lib/auth";
import { defaultRouteForRole, isRoleAllowed } from "../lib/guard";
import { useAuth } from "./AuthProvider";

export const RoleGuard = ({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user && !isRoleAllowed(user.role, allowed)) {
      const redirectTo = defaultRouteForRole(user.role);
      if (pathname !== redirectTo) {
        window.location.href = redirectTo;
      }
    }
  }, [allowed, loading, pathname, user]);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-slate-500">
        Chargement des permissions...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isRoleAllowed(user.role, allowed)) {
    return null;
  }

  return <>{children}</>;
};
