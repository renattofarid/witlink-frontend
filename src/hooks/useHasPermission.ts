import { useAuthStore } from "@/pages/auth/lib/auth.store";

export function useHasPermission(permission: string): boolean {
  const allowedRoutes = useAuthStore((state) => state.allowedRoutes);

  return allowedRoutes.includes(permission);
}
