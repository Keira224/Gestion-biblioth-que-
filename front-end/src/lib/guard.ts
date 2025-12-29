"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/AuthProvider";
import { roleHomeMap, type UserRole } from "@/lib/navigation";

export function useRoleGuard(allowedRoles: UserRole[]) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.replace(roleHomeMap[user.role]);
    }
  }, [allowedRoles, loading, router, user]);

  return { user, loading };
}
