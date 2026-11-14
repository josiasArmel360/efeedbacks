import { getSession } from "@/lib/auth";
import { action, ActionError } from "./standalone-action";

export { ActionError };

export const safeAc = action.use(async ({ next }) => {
  const { user } = await getSession();

  if (!user || !user.id) {
    throw new ActionError("Session non valide ou utilisateur non connecté.");
  }

  const { resolveUserAccess } = await import(
    "@/lib/db/queries/access-control/service"
  );

  const permissions = await resolveUserAccess({
    id: user.id,
    policyId: user.policyId,
    banned: user.banned,
  });
  const modules = permissions?.allowedModules || [];
  const fullAccess = permissions?.hasFullAccess || false;

  return next({
    ctx: { user, modules, fullAccess },
  });
});
