import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { tenant } from "@/lib/db/schema";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { canDo } from "@/lib/helper/utility";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  CREATE_ACCESS_DENIED_MESSAGE,
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import type { Tenant } from "@/lib/types";
import {
  CreateTenantSchema,
  UpdateTenantSchema,
  DeleteTenantSchema,
} from "./validator";

const RES = RESOURCE.SETTING;

// ============================================================================
// ACTIONS CRUD (MUTATIONS SÉCURISÉES)
// ============================================================================

export const createTenant = safeAc
  .inputSchema(CreateTenantSchema)
  .action(async ({ parsedInput: values, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.tenant.findFirst();

      if (existing) {
        throw new ActionError(
          "L'établissement est déjà initialisé. Veuillez utiliser la mise à jour.",
        );
      }

      const [created] = await db
        .insert(tenant)
        .values({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phoneNumber: values.phoneNumber?.trim() || null,
          city: values.city?.trim() || null,
          address: values.address?.trim() || null,
          description: values.description?.trim() || null,
          logo: values.logo?.trim() || null,
        })
        .returning({ id: tenant.id });

      revalidatePath("/settings/my-establishment");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Profil de l'établissement initialisé avec succès.",
        id: created.id,
      };
    } catch (error) {
      console.error("Erreur serveur (createTenant):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible d'initialiser le profil de l'établissement.",
          );
    }
  });

export const updateTenant = safeAc
  .inputSchema(UpdateTenantSchema)
  .action(async ({ parsedInput: data, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.tenant.findFirst({
        where: (t, { eq }) => eq(t.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Profil de l'établissement introuvable.");
      }

      const updatePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) {
        updatePayload.name = data.name.trim();
      }

      if (data.email !== undefined) {
        updatePayload.email = data.email.trim().toLowerCase();
      }

      if (data.phoneNumber !== undefined) {
        updatePayload.phoneNumber = data.phoneNumber?.trim() || null;
      }

      if (data.city !== undefined) {
        updatePayload.city = data.city?.trim() || null;
      }

      if (data.address !== undefined) {
        updatePayload.address = data.address?.trim() || null;
      }

      if (data.description !== undefined) {
        updatePayload.description = data.description?.trim() || null;
      }

      if (data.logo !== undefined) {
        updatePayload.logo = data.logo?.trim() || null;
      }

      await db
        .update(tenant)
        .set(updatePayload)
        .where(eq(tenant.id, data.id));

      revalidatePath("/settings/my-establishment");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Informations de l'établissement mises à jour avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateTenant):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de mettre à jour les informations de l'établissement.",
          );
    }
  });

export const deleteTenant = safeAc
  .inputSchema(DeleteTenantSchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.tenant.findFirst({
        where: (t, { eq }) => eq(t.id, id),
      });

      if (!existing) {
        throw new ActionError("Profil de l'établissement introuvable.");
      }

      await db.delete(tenant).where(eq(tenant.id, id));

      revalidatePath("/settings/my-establishment");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Profil de l'établissement supprimé avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (deleteTenant):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de supprimer le profil de l'établissement.",
          );
    }
  });

// ============================================================================
// FONCTION DE LECTURE (MONO-ÉTABLISSEMENT)
// ============================================================================

export const getTenant = async (): Promise<Tenant | null> => {
  try {
    const item = await db.query.tenant.findFirst({
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });

    return (item as Tenant) || null;
  } catch (error) {
    console.error("Erreur serveur (getTenant):", error);
    return null;
  }
};

