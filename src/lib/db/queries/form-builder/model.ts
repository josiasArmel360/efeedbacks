import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { surveySection, surveyField } from "@/lib/db/schema";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { canDo } from "@/lib/helper/utility";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  CREATE_ACCESS_DENIED_MESSAGE,
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import type {
  ActorType,
  SurveyField,
  SurveyFieldType,
  SurveySection,
} from "@/lib/types";
import {
  CreateSurveySectionSchema,
  UpdateSurveySectionSchema,
  DeleteSurveySectionSchema,
  CreateSurveyFieldSchema,
  UpdateSurveyFieldSchema,
  DeleteSurveyFieldSchema,
} from "./validator";

const RES = RESOURCE.FORM_BUILDER;

// ============================================================================
// TYPES & FILTRES
// ============================================================================

export interface SurveySectionFilterOptions {
  isActive?: boolean;
  includeFields?: boolean;
}

export interface SurveyFieldFilterOptions {
  sectionId?: string;
  fieldType?: SurveyFieldType;
  isActive?: boolean;
}

// ============================================================================
// 1. SECTIONS THÉMATIQUES (ACTIONS CRUD)
// ============================================================================

export const createSurveySection = safeAc
  .inputSchema(CreateSurveySectionSchema)
  .action(async ({ parsedInput: values, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const trimmedTitle = values.title.trim();

      const existing = await db.query.surveySection.findFirst({
        where: (s, { eq }) => eq(s.title, trimmedTitle),
      });

      if (existing) {
        throw new ActionError(
          `Une section portant le titre "${trimmedTitle}" existe déjà.`,
        );
      }

      const [created] = await db
        .insert(surveySection)
        .values({
          title: trimmedTitle,
          description: values.description?.trim() || null,
          targetActors: values.targetActors as ActorType[],
          orderIndex: values.orderIndex ?? 0,
          isActive: values.isActive ?? true,
        })
        .returning({ id: surveySection.id });

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Section thématique créée avec succès.",
        id: created.id,
      };
    } catch (error) {
      console.error("Erreur serveur (createSurveySection):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de créer cette section thématique.");
    }
  });

export const updateSurveySection = safeAc
  .inputSchema(UpdateSurveySectionSchema)
  .action(async ({ parsedInput: data, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.surveySection.findFirst({
        where: (s, { eq }) => eq(s.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Section thématique introuvable.");
      }

      const updatePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) {
        const trimmedTitle = data.title.trim();
        if (trimmedTitle !== existing.title) {
          const duplicate = await db.query.surveySection.findFirst({
            where: (s, { and, eq, ne }) =>
              and(ne(s.id, data.id), eq(s.title, trimmedTitle)),
          });
          if (duplicate) {
            throw new ActionError(
              `Une autre section porte déjà le titre "${trimmedTitle}".`,
            );
          }
        }
        updatePayload.title = trimmedTitle;
      }

      if (data.description !== undefined) {
        updatePayload.description = data.description?.trim() || null;
      }

      if (data.targetActors !== undefined) {
        updatePayload.targetActors = data.targetActors;
      }

      if (data.orderIndex !== undefined) {
        updatePayload.orderIndex = data.orderIndex;
      }

      if (data.isActive !== undefined) {
        updatePayload.isActive = data.isActive;
      }

      await db
        .update(surveySection)
        .set(updatePayload)
        .where(eq(surveySection.id, data.id));

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Section thématique mise à jour avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateSurveySection):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de mettre à jour cette section thématique.",
          );
    }
  });

export const deleteSurveySection = safeAc
  .inputSchema(DeleteSurveySectionSchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.surveySection.findFirst({
        where: (s, { eq }) => eq(s.id, id),
      });

      if (!existing) {
        throw new ActionError("Section thématique introuvable.");
      }

      await db.delete(surveySection).where(eq(surveySection.id, id));

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Section thématique et ses critères supprimés avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (deleteSurveySection):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de supprimer cette section thématique.");
    }
  });

// ============================================================================
// 2. SECTIONS THÉMATIQUES (LECTURES & REQUÊTES)
// ============================================================================

export const getSurveySections = async (
  options?: SurveySectionFilterOptions,
): Promise<SurveySection[]> => {
  try {
    const sections = await db.query.surveySection.findMany({
      where: (s, { and, eq }) => {
        const conditions = [];

        if (options?.isActive !== undefined) {
          conditions.push(eq(s.isActive, options.isActive));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        fields: {
          orderBy: (f, { asc }) => [asc(f.orderIndex), asc(f.label)],
        },
      },
      orderBy: (s, { asc }) => [asc(s.orderIndex), asc(s.title)],
    });

    return (sections as SurveySection[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getSurveySections):", error);
    return [];
  }
};

export const getPublicSurveySections = async (): Promise<SurveySection[]> => {
  try {
    const sections = await db.query.surveySection.findMany({
      where: (s, { eq }) => eq(s.isActive, true),
      with: {
        fields: {
          where: (f, { eq }) => eq(f.isActive, true),
          orderBy: (f, { asc }) => [asc(f.orderIndex), asc(f.label)],
        },
      },
      orderBy: (s, { asc }) => [asc(s.orderIndex), asc(s.title)],
    });

    return (sections as SurveySection[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getPublicSurveySections):", error);
    return [];
  }
};

// ============================================================================
// 3. CRITÈRES & QUESTIONS (ACTIONS CRUD)
// ============================================================================

export const createSurveyField = safeAc
  .inputSchema(CreateSurveyFieldSchema)
  .action(async ({ parsedInput: values, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "create", fullAccess)) {
        throw new ActionError(CREATE_ACCESS_DENIED_MESSAGE);
      }

      const sectionExists = await db.query.surveySection.findFirst({
        where: (s, { eq }) => eq(s.id, values.sectionId),
      });

      if (!sectionExists) {
        throw new ActionError("La section de rattachement est introuvable.");
      }

      const trimmedLabel = values.label.trim();
      const needsOptions =
        values.fieldType === "radio" || values.fieldType === "select";

      if (needsOptions && (!values.options || values.options.length === 0)) {
        throw new ActionError(
          "Veuillez renseigner au moins une option de réponse pour ce type de champ.",
        );
      }

      const [created] = await db
        .insert(surveyField)
        .values({
          sectionId: values.sectionId,
          label: trimmedLabel,
          description: values.description?.trim() || null,
          fieldType: values.fieldType as SurveyFieldType,
          options: needsOptions ? values.options || [] : null,
          targetActors: values.targetActors as ActorType[],
          isRequired: values.isRequired ?? true,
          orderIndex: values.orderIndex ?? 0,
          isActive: values.isActive ?? true,
        })
        .returning({ id: surveyField.id });

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Critère d'évaluation créé avec succès.",
        id: created.id,
      };
    } catch (error) {
      console.error("Erreur serveur (createSurveyField):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de créer ce critère d'évaluation.");
    }
  });

export const updateSurveyField = safeAc
  .inputSchema(UpdateSurveyFieldSchema)
  .action(async ({ parsedInput: data, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.surveyField.findFirst({
        where: (f, { eq }) => eq(f.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Critère d'évaluation introuvable.");
      }

      const updatePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.sectionId !== undefined) {
        updatePayload.sectionId = data.sectionId;
      }

      if (data.label !== undefined) {
        updatePayload.label = data.label.trim();
      }

      if (data.description !== undefined) {
        updatePayload.description = data.description?.trim() || null;
      }

      const effectiveType = data.fieldType ?? existing.fieldType;
      const needsOptions =
        effectiveType === "radio" || effectiveType === "select";

      if (data.fieldType !== undefined) {
        updatePayload.fieldType = data.fieldType;
      }

      if (data.options !== undefined || data.fieldType !== undefined) {
        const resolvedOptions =
          data.options !== undefined ? data.options : existing.options;

        if (
          needsOptions &&
          (!resolvedOptions || resolvedOptions.length === 0)
        ) {
          throw new ActionError(
            "Veuillez renseigner au moins une option de réponse pour ce type de champ.",
          );
        }

        updatePayload.options = needsOptions ? resolvedOptions || [] : null;
      }

      if (data.targetActors !== undefined) {
        updatePayload.targetActors = data.targetActors;
      }

      if (data.isRequired !== undefined) {
        updatePayload.isRequired = data.isRequired;
      }

      if (data.orderIndex !== undefined) {
        updatePayload.orderIndex = data.orderIndex;
      }

      if (data.isActive !== undefined) {
        updatePayload.isActive = data.isActive;
      }

      await db
        .update(surveyField)
        .set(updatePayload)
        .where(eq(surveyField.id, data.id));

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Critère d'évaluation mis à jour avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateSurveyField):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible de mettre à jour ce critère d'évaluation.",
          );
    }
  });

export const deleteSurveyField = safeAc
  .inputSchema(DeleteSurveyFieldSchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.surveyField.findFirst({
        where: (f, { eq }) => eq(f.id, id),
      });

      if (!existing) {
        throw new ActionError("Critère d'évaluation introuvable.");
      }

      await db.delete(surveyField).where(eq(surveyField.id, id));

      revalidatePath("/hospital-management/forms-builder");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Critère d'évaluation supprimé avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (deleteSurveyField):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de supprimer ce critère d'évaluation.");
    }
  });

// ============================================================================
// 4. CRITÈRES & QUESTIONS (LECTURES & REQUÊTES)
// ============================================================================

export const getSurveyFields = async (
  options?: SurveyFieldFilterOptions,
): Promise<SurveyField[]> => {
  try {
    const fields = await db.query.surveyField.findMany({
      where: (f, { and, eq }) => {
        const conditions = [];

        if (options?.sectionId) {
          conditions.push(eq(f.sectionId, options.sectionId));
        }

        if (options?.fieldType) {
          conditions.push(eq(f.fieldType, options.fieldType));
        }

        if (options?.isActive !== undefined) {
          conditions.push(eq(f.isActive, options.isActive));
        }

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        section: {
          columns: { id: true, title: true, orderIndex: true },
        },
      },
      orderBy: (f, { asc }) => [asc(f.orderIndex), asc(f.label)],
    });

    return (fields as SurveyField[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getSurveyFields):", error);
    return [];
  }
};
