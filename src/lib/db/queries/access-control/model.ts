import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { canDo } from "@/lib/helper/utility";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  CREATE_ACCESS_DENIED_MESSAGE,
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import type { AccessPolicy, AllowedModule } from "@/lib/types";
import { accessPolicy, permissionException } from "@/lib/db/schema";
import {
  CreateAccessPolicySchema,
  UpdateAccessPolicySchema,
  DeleteAccessPolicySchema,
  SaveUserExceptionSchema,
  DeleteUserExceptionSchema,
  AccessControlSchema,
} from "./validator";
import { getUser } from "../user/model";

const RES = RESOURCE.ACC_RIGHT;

// ============================================================================
// TYPES & FILTRES
// ============================================================================

export interface AccessPolicyFilterOptions {
  hasFullAccess?: boolean;
  isActive?: boolean;
  includeDeleted?: boolean;
}

// ============================================================================
// POLITIQUES D'ACCÈS (ACTIONS CRUD)
// ============================================================================

export const createAccessPolicy = safeAc
  .inputSchema(CreateAccessPolicySchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const normalizedCode = parsedInput.code.trim().toLowerCase();

      const existing = await db.query.accessPolicy.findFirst({
        where: (r, { and, eq, isNull }) =>
          and(eq(r.code, normalizedCode), isNull(r.deletedAt)),
      });

      if (existing) {
        throw new ActionError(
          `Le profil avec le code "${normalizedCode}" existe déjà.`,
        );
      }

      const [created] = await db
        .insert(accessPolicy)
        .values({
          name: parsedInput.name.trim(),
          code: normalizedCode,
          description: parsedInput.description?.trim() || null,
          hasFullAccess: parsedInput.hasFullAccess ?? false,
          isActive: parsedInput.isActive ?? true,
          allowedModules: [],
        })
        .returning({ id: accessPolicy.id });

      revalidatePath("/settings/access-rights");

      return {
        success: true,
        message: "Profil créé avec succès.",
        id: created.id,
      };
    } catch (error) {
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de créer cet profil.");
    }
  });

export const updateAccessPolicy = safeAc
  .inputSchema(UpdateAccessPolicySchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const { id, code, ...data } = parsedInput;

      const existing = await db.query.accessPolicy.findFirst({
        where: (r, { eq, and, isNull }) =>
          and(eq(r.id, id), isNull(r.deletedAt)),
      });

      if (!existing) {
        throw new ActionError("Profil introuvable.");
      }

      if (code !== existing.code) {
        const normalizedCode = code.trim().toLowerCase();
        const duplicate = await db.query.accessPolicy.findFirst({
          where: (r, { and, eq, isNull, ne }) =>
            and(ne(r.id, id), eq(r.code, normalizedCode), isNull(r.deletedAt)),
        });
        if (duplicate) {
          throw new ActionError(
            `Le code technique "${normalizedCode}" est déjà attribué à une autre profile.`,
          );
        }
      }

      await db
        .update(accessPolicy)
        .set({ code: code.trim().toLowerCase(), ...data })
        .where(eq(accessPolicy.id, id));

      revalidatePath("/settings/access-rights");

      return {
        success: true,
        message: "Profil mis à jour avec succès.",
      };
    } catch (error) {
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de mettre à jour cet profil.");
    }
  });

export const deleteAccessPolicy = safeAc
  .inputSchema(DeleteAccessPolicySchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.accessPolicy.findFirst({
        where: (r, { eq, and, isNull }) =>
          and(eq(r.id, id), isNull(r.deletedAt)),
      });

      if (!existing) {
        throw new ActionError("Profil introuvable.");
      }

      if (existing.code === "administrateur") {
        throw new ActionError(
          "Le profil administrateur système ne peut pas être supprimé.",
        );
      }

      await db
        .update(accessPolicy)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(accessPolicy.id, id));

      revalidatePath("/settings/access-rights");

      return {
        success: true,
        message: "Politique d'accès supprimée avec succès.",
      };
    } catch (error) {
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de supprimer cet profil.");
    }
  });

export const manageAccessControl = safeAc
  .inputSchema(AccessControlSchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const { id, ...data } = parsedInput;

      const existing = await db.query.accessPolicy.findFirst({
        where: (r, { eq, and, isNull }) =>
          and(eq(r.id, id), eq(r.isActive, true), isNull(r.deletedAt)),
      });

      if (!existing) {
        throw new ActionError("Profil introuvable.");
      }

      await db
        .update(accessPolicy)
        .set({ ...data })
        .where(eq(accessPolicy.id, id));

      revalidatePath("/settings/access-rights");

      return {
        success: true,
        message: "Droits d'accès mis à jour avec succès.",
      };
    } catch (error) {
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de configurer cette politique d'accès.");
    }
  });

// ============================================================================
// POLITIQUES D'ACCÈS (LECTURES & REQUÊTES)
// ============================================================================

export const getAccessPolicy = async (
  id: string,
): Promise<AccessPolicy | null> => {
  try {
    const policy = await db.query.accessPolicy.findFirst({
      where: (r, { eq, and, isNull }) => and(eq(r.id, id), isNull(r.deletedAt)),
    });

    return (policy as AccessPolicy) || null;
  } catch (error) {
    console.error("Failed to fetch access policy:", error);
    return null;
  }
};

export const getAccessPolicies = async (
  options?: AccessPolicyFilterOptions,
): Promise<AccessPolicy[]> => {
  try {
    const policies = await db.query.accessPolicy.findMany({
      where: (r, { eq, and, isNull }) => {
        const conditions = [];

        if (!options?.includeDeleted) {
          conditions.push(isNull(r.deletedAt));
        }

        if (options?.hasFullAccess !== undefined) {
          conditions.push(eq(r.hasFullAccess, options.hasFullAccess));
        }

        if (options?.isActive !== undefined) {
          conditions.push(eq(r.isActive, options.isActive));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    return policies as AccessPolicy[];
  } catch (error) {
    console.error("Failed to fetch access policies:", error);
    return [];
  }
};

export const getAccessPolicyByCode = async (
  code: string,
): Promise<AccessPolicy | null> => {
  try {
    const policy = await db.query.accessPolicy.findFirst({
      where: (r, { and, eq, isNull }) =>
        and(eq(r.code, code.trim().toLowerCase()), isNull(r.deletedAt)),
    });
    return (policy as AccessPolicy) || null;
  } catch {
    return null;
  }
};

export const getUserPolicies = async (policyId: string) => {
  try {
    const policies = await db.query.accessPolicy.findMany({
      where: (ap, { eq, and, isNull }) => {
        return and(
          eq(ap.isActive, true),
          eq(ap.id, policyId),
          isNull(ap.deletedAt),
        );
      },
    });
    return policies || [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des politiques d'accès:",
      error,
    );
    return [];
  }
};

// ============================================================================
// DÉROGATIONS UTILISATEURS (USER PERMISSION EXCEPTIONS)
// ============================================================================

export const saveUserException = safeAc
  .inputSchema(SaveUserExceptionSchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const targetUser = await getUser(parsedInput.userId);

      if (!targetUser) {
        throw new ActionError(
          "Collaborateur introuvable dans votre établissement.",
        );
      }

      const existing = await db.query.permissionException.findFirst({
        where: (upe, { eq }) => eq(upe.userId, parsedInput.userId),
      });

      let savedRecord;

      if (existing) {
        const [updated] = await db
          .update(permissionException)
          .set({
            allowedModules: parsedInput.allowedModules as AllowedModule[],
            hasFullAccess: parsedInput.hasFullAccess,
            updatedAt: new Date(),
          })
          .where(eq(permissionException.userId, parsedInput.userId))
          .returning();

        savedRecord = updated;
      } else {
        const [created] = await db
          .insert(permissionException)
          .values({
            userId: parsedInput.userId,
            allowedModules: parsedInput.allowedModules as AllowedModule[],
            hasFullAccess: parsedInput.hasFullAccess,
          })
          .returning();

        savedRecord = created;
      }

      if (!savedRecord) {
        throw new ActionError(
          "Échec de l'enregistrement de la dérogation de droits.",
        );
      }

      revalidatePath("/admin/settings/access-rights");
      revalidatePath("/settings/access-rights");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Droits d'accès personnalisés enregistrés avec succès.",
        data: savedRecord,
      };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      console.error("Erreur serveur (saveUserException):", error);
      throw new ActionError(
        "Une erreur est survenue lors de l'enregistrement des droits d'accès.",
      );
    }
  });

export const deleteUserException = safeAc
  .inputSchema(DeleteUserExceptionSchema)
  .action(async ({ parsedInput, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const targetUser = await getUser(parsedInput.userId);

      if (!targetUser) {
        throw new ActionError(
          "Collaborateur introuvable dans votre établissement.",
        );
      }

      const deleted = await db
        .delete(permissionException)
        .where(eq(permissionException.userId, parsedInput.userId))
        .returning({ id: permissionException.id });

      if (!deleted || deleted.length === 0) {
        throw new ActionError(
          "Aucune dérogation de droits à réinitialiser pour ce collaborateur.",
        );
      }

      revalidatePath("/admin/settings/access-rights");
      revalidatePath("/settings/access-rights");
      revalidatePath("/", "layout");

      return {
        success: true,
        message:
          "Droits réinitialisés aux permissions par défaut de la politique d'accès.",
      };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      console.error("Erreur serveur (deleteUserException):", error);
      throw new ActionError(
        "Une erreur est survenue lors de la réinitialisation des droits.",
      );
    }
  });

export const getUserException = async (userId: string) => {
  try {
    const res = await db.query.permissionException.findFirst({
      where: (upe, { eq }) => eq(upe.userId, userId),
    });
    return res || null;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la dérogation utilisateur:",
      error,
    );
    return null;
  }
};

export const getAllUsersExceptions = async () => {
  try {
    const exceptions = await db.query.permissionException.findMany({
      with: { user: true },
    });
    return exceptions;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des exceptions d'accès:",
      error,
    );
    return [];
  }
};
