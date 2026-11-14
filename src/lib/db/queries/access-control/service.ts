import { cache } from "react";
import {
  getUserException,
  getUserPolicies,
  saveUserException,
  deleteUserException,
  createAccessPolicy,
  updateAccessPolicy,
  deleteAccessPolicy,
  getAccessPolicy,
  getAccessPolicies,
  getAccessPolicyByCode,
  type AccessPolicyFilterOptions,
  manageAccessControl,
} from "./model";
import { AllowedModule, CrudAction } from "@/lib/types";
import { getSession } from "@/lib/auth";
import { canDo } from "@/lib/helper/utility";
import type {
  CreateAccessPolicyPayload,
  UpdateAccessPolicyPayload,
  DeleteAccessPolicyPayload,
  SaveUserExceptionPayload,
  DeleteUserExceptionPayload,
  AccessControlData,
} from "./validator";

// ============================================================================
// MOTEUR DE CONTRÔLE D'ACCÈS
// ============================================================================

export const resolveUserAccess = async (user: {
  policyId?: string;
  banned: boolean;
  id: string;
}) => {
  if (user.banned) return { allowedModules: [], hasFullAccess: false };

  const exception = await getUserException(user.id);
  if (exception) {
    return {
      allowedModules: exception.allowedModules || [],
      hasFullAccess: exception.hasFullAccess || false,
    };
  }

  const policyId = user.policyId;
  if (!policyId) {
    return { allowedModules: [], hasFullAccess: false };
  }

  const policies = await getUserPolicies(policyId);

  if (policies.length === 0) {
    return { allowedModules: [], hasFullAccess: false };
  }

  let hasFullAccess = false;
  const mergedModules = new Map<string, Set<CrudAction>>();

  for (const policy of policies) {
    if (policy.hasFullAccess) hasFullAccess = true;
    for (const mod of policy.allowedModules || []) {
      if (!mod.hasAccess) continue;
      const currentActions =
        mergedModules.get(mod.resource) || new Set<CrudAction>();
      (mod.actions || []).forEach((a) => currentActions.add(a));
      mergedModules.set(mod.resource, currentActions);
    }
  }

  const allowedModules: AllowedModule[] = Array.from(
    mergedModules.entries(),
  ).map(([resource, actionsSet]) => ({
    resource,
    hasAccess: true,
    actions: Array.from(actionsSet),
  }));

  return { allowedModules, hasFullAccess };
};

export const requireAccess = cache(
  async (resource: string, action: CrudAction = "read"): Promise<boolean> => {
    const { user } = await getSession();
    if (!user) return false;

    const permissions = await resolveUserAccess({
      id: user.id,
      policyId: user.policyId,
      banned: user.banned,
    });

    return canDo(
      permissions.allowedModules,
      resource,
      action,
      permissions.hasFullAccess,
    );
  },
);

// ============================================================================
// FAÇADES POLITIQUES D'ACCÈS (SERVICES)
// ============================================================================

export const createPolicy = async (payload: CreateAccessPolicyPayload) => {
  return await createAccessPolicy(payload);
};

export const updatePolicy = async (payload: UpdateAccessPolicyPayload) => {
  return await updateAccessPolicy(payload);
};

export const deletePolicy = async (payload: DeleteAccessPolicyPayload) => {
  return await deleteAccessPolicy(payload);
};

export const getPolicy = async (id: string) => {
  return await getAccessPolicy(id);
};

export const getPolicies = async (options?: AccessPolicyFilterOptions) => {
  return await getAccessPolicies(options);
};

export const getPolicyByCode = async (code: string) => {
  return await getAccessPolicyByCode(code);
};

export const manageAccess = async (payload: AccessControlData) => {
  return await manageAccessControl(payload);
};

// ============================================================================
// FAÇADES DÉROGATIONS UTILISATEURS (SERVICES)
// ============================================================================

export const saveException = async (payload: SaveUserExceptionPayload) => {
  return await saveUserException(payload);
};

export const removeException = async (payload: DeleteUserExceptionPayload) => {
  return await deleteUserException(payload);
};

export const getException = async (userId: string) => {
  return await getUserException(userId);
};

// export const getExceptions = async () => {
//   return await getAllUsersExceptions();
// };

// CreateAccessPolicyPayload,
// UpdateAccessPolicyPayload,
// DeleteAccessPolicyPayload,
// SaveUserExceptionPayload,
// DeleteUserExceptionPayload,
export type { AccessPolicyFilterOptions };
