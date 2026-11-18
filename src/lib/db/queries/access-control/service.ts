import { cache } from "react";
import { db } from "@/lib/db/client";
import {
  getUserException,
  saveUserException,
  deleteUserException,
  createAccessPolicy,
  updateAccessPolicy,
  deleteAccessPolicy,
  getAccessPolicy,
  getAccessPolicies,
  type AccessPolicyFilterOptions,
  manageAccessControl,
} from "./model";
import { CrudAction } from "@/lib/types";
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

export const resolveUserAccess = cache(
  async (user: { policyId?: string; banned: boolean; id: string }) => {
    if (user.banned) return { allowedModules: [], hasFullAccess: false };

    const userData = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, user.id),
      with: {
        policy: true,
        permissionException: true,
      },
    });

    if (!userData || userData.banned || userData.deletedAt) {
      return { allowedModules: [], hasFullAccess: false };
    }

    // 1. Dérogation prioritaire
    if (userData.permissionException) {
      return {
        allowedModules: userData.permissionException.allowedModules || [],
        hasFullAccess: userData.permissionException.hasFullAccess || false,
      };
    }

    // 2. Politique directe O(1)
    if (
      userData.policy &&
      userData.policy.isActive &&
      !userData.policy.deletedAt
    ) {
      return {
        allowedModules: userData.policy.allowedModules || [],
        hasFullAccess: userData.policy.hasFullAccess || false,
      };
    }

    return { allowedModules: [], hasFullAccess: false };
  },
);

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

export type { AccessPolicyFilterOptions };
