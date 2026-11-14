import { useAuthStore } from "@/lib/db/queries/auth/store";
import { canAccess as Acc, canDo as Do } from "@/lib/helper/utility";
import type { CrudAction } from "@/lib/types";

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);
  const hfAcces = user?.permissions?.hasFullAccess ?? false;
  const allMods = user?.permissions?.allowedModules ?? [];

  return {
    user,
    hasFullAccess: hfAcces,
    canAccess: (res: string) => Acc(allMods, res, hfAcces),
    canDo: (res: string, act: CrudAction) => Do(allMods, res, act, hfAcces),
  };
};
