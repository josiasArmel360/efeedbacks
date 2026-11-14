import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { department } from "@/lib/db/schema";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { canDo } from "@/lib/helper/utility";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  CREATE_ACCESS_DENIED_MESSAGE,
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import type { Department } from "@/lib/types";
import {
  CreateDepartmentSchema,
  UpdateDepartmentSchema,
  DeleteDepartmentSchema,
} from "./validator";

const RES = RESOURCE.DEPARTMENT;

export interface DepartmentFilterOptions {
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// ACTIONS CRUD (MUTATIONS SÉCURISÉES)
// ============================================================================

export const createDepartment = safeAc
  .inputSchema(CreateDepartmentSchema)
  .action(async ({ parsedInput: values, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const trimmedName = values.name.trim();

      const existing = await db.query.department.findFirst({
        where: (d, { eq }) => eq(d.name, trimmedName),
      });

      if (existing) {
        throw new ActionError(
          `Un service avec le nom "${trimmedName}" existe déjà.`,
        );
      }

      const [created] = await db
        .insert(department)
        .values({
          name: trimmedName,
          description: values.description?.trim() || null,
          orderIndex: values.orderIndex ?? 0,
          isActive: values.isActive ?? true,
        })
        .returning({ id: department.id });

      revalidatePath("/hospital-management/departments");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Service hospitalier créé avec succès.",
        id: created.id,
      };
    } catch (error) {
      console.error("Erreur serveur (createDepartment):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de créer ce service hospitalier.");
    }
  });

export const updateDepartment = safeAc
  .inputSchema(UpdateDepartmentSchema)
  .action(async ({ parsedInput: data, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.department.findFirst({
        where: (d, { eq }) => eq(d.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Service hospitalier introuvable.");
      }

      const updatePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) {
        const trimmedName = data.name.trim();
        if (trimmedName !== existing.name) {
          const duplicate = await db.query.department.findFirst({
            where: (d, { and, eq, ne }) =>
              and(ne(d.id, data.id), eq(d.name, trimmedName)),
          });
          if (duplicate) {
            throw new ActionError(
              `Un autre service hospitalier porte déjà le nom "${trimmedName}".`,
            );
          }
        }
        updatePayload.name = trimmedName;
      }

      if (data.description !== undefined) {
        updatePayload.description = data.description?.trim() || null;
      }

      if (data.orderIndex !== undefined) {
        updatePayload.orderIndex = data.orderIndex;
      }

      if (data.isActive !== undefined) {
        updatePayload.isActive = data.isActive;
      }

      await db
        .update(department)
        .set(updatePayload)
        .where(eq(department.id, data.id));

      revalidatePath("/hospital-management/departments");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Service hospitalier mis à jour avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateDepartment):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de mettre à jour ce service hospitalier.",
          );
    }
  });

export const deleteDepartment = safeAc
  .inputSchema(DeleteDepartmentSchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.department.findFirst({
        where: (d, { eq }) => eq(d.id, id),
      });

      if (!existing) {
        throw new ActionError("Service hospitalier introuvable.");
      }

      await db.delete(department).where(eq(department.id, id));

      revalidatePath("/hospital-management/departments");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Service hospitalier supprimé avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (deleteDepartment):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de supprimer ce service hospitalier.");
    }
  });

// ============================================================================
// FONCTIONS DE LECTURE (QUERIES)
// ============================================================================

export const getDepartment = async (id: string): Promise<Department | null> => {
  try {
    const dep = await db.query.department.findFirst({
      where: (d, { eq }) => eq(d.id, id),
    });

    return (dep as Department) || null;
  } catch (error) {
    console.error("Erreur serveur (getDepartment):", error);
    return null;
  }
};

export const getDepartments = async (
  options?: DepartmentFilterOptions,
): Promise<Department[]> => {
  try {
    const deps = await db.query.department.findMany({
      where: (d, { and, eq, ilike, or }) => {
        const conditions = [];

        if (options?.isActive !== undefined) {
          conditions.push(eq(d.isActive, options.isActive));
        }

        if (options?.search) {
          const pattern = `%${options.search.trim()}%`;
          conditions.push(
            or(ilike(d.name, pattern), ilike(d.description, pattern)),
          );
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      orderBy: (d, { asc }) => [asc(d.orderIndex), asc(d.name)],
    });

    return (deps as Department[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getDepartments):", error);
    return [];
  }
};

export const getActiveDepartments = async (): Promise<Department[]> => {
  return await getDepartments({ isActive: true });
};
