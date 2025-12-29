import type { UserRole } from "./auth";

export const isRoleAllowed = (role: UserRole | null | undefined, allowed: UserRole[]) => {
  if (!role) return false;
  if (role === "ADMIN") return true;
  return allowed.includes(role);
};

export const defaultRouteForRole = (role: UserRole | null | undefined) => {
  if (!role) return "/login";
  if (role === "ADMIN") return "/admin";
  if (role === "BIBLIOTHECAIRE") return "/bibliothecaire";
  return "/lecteur";
};
