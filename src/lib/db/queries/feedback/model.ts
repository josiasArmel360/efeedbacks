import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

import { db } from "@/lib/db/client";
import { feedback, feedbackAnswer } from "@/lib/db/schema";
import { ActionError, safeAc } from "@/lib/helper/auth-action";
import { action } from "@/lib/helper/standalone-action";
import { canDo } from "@/lib/helper/utility";
import { RESOURCE } from "@/lib/config/access.modules";
import {
  DELETE_ACCESS_DENIED_MESSAGE,
  UPDATE_ACCESS_DENIED_MESSAGE,
} from "@/lib/constants";
import type {
  ActorType,
  Feedback,
  FeedbackPriority,
  FeedbackStatus,
} from "@/lib/types";
import {
  UpdateFeedbackSchema,
  DeleteFeedbackSchema,
  SubmitFeedbackBaseSchema,
} from "./validator";

const RES = RESOURCE.FEEDBACK;

// ============================================================================
// GESTION DU DÉBIT (RATE LIMITING IP) & CODES UNIQUES
// ============================================================================

const ipRateLimitMap = new Map<string, number[]>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 5;

  const timestamps = (ipRateLimitMap.get(ip) || []).filter(
    (t) => now - t < windowMs,
  );

  if (timestamps.length >= maxAttempts) {
    return false;
  }

  timestamps.push(now);
  ipRateLimitMap.set(ip, timestamps);
  return true;
};

const generateCodeCandidate = (year: number): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FB-${year}-${suffix}`;
};

const generateUniqueFeedbackCode = async (): Promise<string> => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateCodeCandidate(year);
    const existing = await db.query.feedback.findFirst({
      where: (f, { eq }) => eq(f.code, candidate),
      columns: { id: true },
    });
    if (!existing) {
      return candidate;
    }
  }
  // En cas de collision improbable
  return `FB-${year}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
};

export interface FeedbackFilterOptions {
  status?: FeedbackStatus;
  actorType?: ActorType;
  departmentId?: string;
  priority?: FeedbackPriority;
}

// ============================================================================
// ACTIONS CRUD (MUTATIONS SÉCURISÉES)
// ============================================================================

export const updateFeedback = safeAc
  .inputSchema(UpdateFeedbackSchema)
  .action(async ({ parsedInput: data, ctx: { user, modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "update", fullAccess)) {
        throw new ActionError(UPDATE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.feedback.findFirst({
        where: (f, { eq }) => eq(f.id, data.id),
      });

      if (!existing) {
        throw new ActionError("Avis ou signalement introuvable.");
      }

      const updatePayload: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (data.status !== undefined) {
        updatePayload.status = data.status;

        if (data.status === "traite") {
          if (existing.status !== "traite" || !existing.treatedAt) {
            updatePayload.treatedAt = new Date();
            updatePayload.treatedByUserId = user.id;
          }
        } else {
          updatePayload.treatedAt = null;
          updatePayload.treatedByUserId = null;
        }
      }

      if (data.priority !== undefined) {
        updatePayload.priority = data.priority;
      }

      if (data.assignedToUserId !== undefined) {
        updatePayload.assignedToUserId =
          data.assignedToUserId && data.assignedToUserId !== "none"
            ? data.assignedToUserId
            : null;
      }

      if (data.internalNotes !== undefined) {
        updatePayload.internalNotes = data.internalNotes?.trim() || null;
      }

      if (data.correctiveAction !== undefined) {
        updatePayload.correctiveAction = data.correctiveAction?.trim() || null;
      }

      await db
        .update(feedback)
        .set(updatePayload)
        .where(eq(feedback.id, data.id));

      revalidatePath("/feedbacks");
      revalidatePath("/dashboard");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Instruction de l'avis enregistrée avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (updateFeedback):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de mettre à jour cet avis.");
    }
  });

export const deleteFeedback = safeAc
  .inputSchema(DeleteFeedbackSchema)
  .action(async ({ parsedInput: { id }, ctx: { modules, fullAccess } }) => {
    try {
      if (!canDo(modules, RES, "delete", fullAccess)) {
        throw new ActionError(DELETE_ACCESS_DENIED_MESSAGE);
      }

      const existing = await db.query.feedback.findFirst({
        where: (f, { eq }) => eq(f.id, id),
      });

      if (!existing) {
        throw new ActionError("Avis ou signalement introuvable.");
      }

      await db.delete(feedback).where(eq(feedback.id, id));

      revalidatePath("/feedbacks");
      revalidatePath("/dashboard");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Avis supprimé avec succès.",
      };
    } catch (error) {
      console.error("Erreur serveur (deleteFeedback):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError("Impossible de supprimer cet avis.");
    }
  });

export const submitFeedback = action
  .inputSchema(SubmitFeedbackBaseSchema)
  .action(async ({ parsedInput: data }) => {
    try {
      // 1. Protection Anti-Abus : Honeypot
      if (data.website && data.website.length > 0) {
        throw new ActionError("Validation du formulaire échouée.");
      }

      // 2. Protection Anti-Abus : Limitation de débit par IP (5 soumissions / 10 min)
      const headerList = await headers();
      const forwarded = headerList.get("x-forwarded-for");
      const realIp = headerList.get("x-real-ip");
      const ip =
        (forwarded ? forwarded.split(",")[0].trim() : realIp?.trim()) ||
        "anonymous";

      if (!checkRateLimit(ip)) {
        throw new ActionError(
          "Trop de dépôts récents depuis votre connexion. Veuillez patienter quelques minutes.",
        );
      }

      // 3. Calcul de priorité automatique
      let priority: FeedbackPriority = "normale";
      if (data.overallRating === 1) {
        priority = "urgente";
      } else if (data.overallRating === 2) {
        priority = "haute";
      }

      // 4. Confidentialité stricte des données nominatives
      const isAnon = data.isAnonymous;
      const authorName = isAnon ? null : data.authorName?.trim() || null;
      const authorEmail = isAnon
        ? null
        : data.authorEmail?.trim()?.toLowerCase() || null;
      const authorPhone = isAnon ? null : data.authorPhone?.trim() || null;
      const authorRoleOrRoom = isAnon
        ? null
        : data.authorRoleOrRoom?.trim() || null;

      // 5. Génération du code unique de suivi (FB-YYYY-XXXX)
      const uniqueCode = await generateUniqueFeedbackCode();

      // 6. Récupération des champs actifs pour figer les libellés (snapshots)
      const activeFields = await db.query.surveyField.findMany({
        where: (f, { eq }) => eq(f.isActive, true),
      });
      const fieldMap = new Map(activeFields.map((f) => [f.id, f]));

      // 7. Enregistrement transactionnel (Avis + Réponses aux critères)
      const formattedVisitDate = data.visitDate
        ? format(data.visitDate, "dd/MM/yyyy")
        : null;

      const result = await db.transaction(async (tx) => {
        const [createdFeedback] = await tx
          .insert(feedback)
          .values({
            code: uniqueCode,
            actorType: data.actorType,
            isAnonymous: data.isAnonymous,
            authorName,
            authorEmail,
            authorPhone,
            authorRoleOrRoom,
            departmentId: data.departmentId || null,
            visitDate: formattedVisitDate,
            overallRating: data.overallRating,
            recommendation: data.recommendation,
            positivePoints: data.positivePoints?.trim() || null,
            negativePoints: data.negativePoints?.trim() || null,
            suggestions: data.suggestions?.trim() || null,
            answersSnapshot: data.answers || {},
            status: "nouveau",
            priority,
          })
          .returning({ id: feedback.id, code: feedback.code });

        if (data.answers && typeof data.answers === "object") {
          const answerEntries = Object.entries(data.answers);
          for (const [fieldId, answerVal] of answerEntries) {
            if (
              answerVal !== undefined &&
              answerVal !== null &&
              answerVal !== ""
            ) {
              const fieldDef = fieldMap.get(fieldId);
              // Si le critère existe en base, on l'associe
              if (fieldDef) {
                const isDate = answerVal instanceof Date;
                const isNumber =
                  typeof answerVal === "number" ||
                  (!isNaN(Number(answerVal)) && answerVal !== "" && !isDate);

                const numVal = isNumber ? Number(answerVal) : null;
                const textVal = isDate
                  ? format(answerVal, "dd/MM/yyyy")
                  : String(answerVal);

                await tx.insert(feedbackAnswer).values({
                  feedbackId: createdFeedback.id,
                  fieldId: fieldDef.id,
                  fieldLabelSnapshot: fieldDef.label,
                  valueNumber:
                    numVal !== null && Number.isInteger(numVal) ? numVal : null,
                  valueText: textVal,
                });
              }
            }
          }
        }

        return createdFeedback;
      });

      // 8. Invalidation des caches
      revalidatePath("/feedbacks");
      revalidatePath("/dashboard");
      revalidatePath("/", "layout");

      return {
        success: true,
        message: "Votre avis a été enregistré avec succès.",
        code: result.code,
        id: result.id,
      };
    } catch (error) {
      console.error("Erreur serveur (submitFeedback):", error);
      throw error instanceof ActionError
        ? error
        : new ActionError(
            "Impossible d'enregistrer votre avis. Veuillez réessayer.",
          );
    }
  });

// ============================================================================
// FONCTIONS DE LECTURE (QUERIES)
// ============================================================================

export const getFeedback = async (id: string): Promise<Feedback | null> => {
  try {
    const item = await db.query.feedback.findFirst({
      where: (f, { eq }) => eq(f.id, id),
      with: {
        department: true,
        assignedTo: { columns: { id: true, name: true, email: true } },
        answers: {
          orderBy: (a, { asc }) => [asc(a.createdAt)],
        },
      },
    });

    return (item as unknown as Feedback) || null;
  } catch (error) {
    console.error("Erreur serveur (getFeedback):", error);
    return null;
  }
};

export const getFeedbackByCode = async (
  rawCode: string,
): Promise<Feedback | null> => {
  try {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) return null;

    const item = await db.query.feedback.findFirst({
      where: (f, { eq }) => eq(f.code, normalizedCode),
      with: {
        department: true,
        answers: {
          orderBy: (a, { asc }) => [asc(a.createdAt)],
        },
      },
    });

    if (!item) return null;

    // Masquage des notes internes et coordonnées privées pour la consultation publique
    return {
      ...(item as unknown as Feedback),
      internalNotes: null,
      authorEmail: null,
      authorPhone: null,
      assignedTo: null,
    };
  } catch (error) {
    console.error("Erreur serveur (getFeedbackByCode):", error);
    return null;
  }
};

export const getFeedbacks = async (
  options?: FeedbackFilterOptions,
): Promise<Feedback[]> => {
  try {
    const items = await db.query.feedback.findMany({
      where: (f, { and, eq }) => {
        const conditions = [
          options?.status ? eq(f.status, options.status) : undefined,
          options?.actorType ? eq(f.actorType, options.actorType) : undefined,
          options?.departmentId
            ? eq(f.departmentId, options.departmentId)
            : undefined,
          options?.priority ? eq(f.priority, options.priority) : undefined,
        ].filter(Boolean);

        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        department: true,
        assignedTo: { columns: { id: true, name: true, email: true } },
      },
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });

    return (items as Feedback[]) || [];
  } catch (error) {
    console.error("Erreur serveur (getFeedbacks):", error);
    return [];
  }
};

import {
  buildDashboardKPIsFromFeedbacks,
  type DashboardDepartmentStat,
  type DashboardKPIsData,
  type DashboardRatingPoint,
  type DashboardTrendPoint,
} from "@/lib/helper/dashboard-kpis";

export type {
  DashboardDepartmentStat,
  DashboardKPIsData,
  DashboardRatingPoint,
  DashboardTrendPoint,
};

export const getDashboardKPIs = async (): Promise<DashboardKPIsData> => {
  const items = await getFeedbacks();
  return buildDashboardKPIsFromFeedbacks(items);
};
