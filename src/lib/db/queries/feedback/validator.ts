import { z } from "zod";
import { optionalEmail, requiredString } from "@/lib/validator-rules";
import {
  ACTOR_TYPE,
  FEEDBACK_PRIORITY,
  FEEDBACK_STATUS,
  RECOMMENDATION,
} from "@/lib/constants";
import type { SurveyField } from "@/lib/types";

export const FeedbackTreatmentSchema = z.object({
  status: z.enum(FEEDBACK_STATUS, {
    message: "Le statut de traitement est invalide.",
  }),
  priority: z.enum(FEEDBACK_PRIORITY, {
    message: "Le niveau de priorité est invalide.",
  }),
  assignedToUserId: z.string().trim().optional().nullable(),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Les notes internes ne doivent pas dépasser 2000 caractères.")
    .optional()
    .nullable(),
  correctiveAction: z
    .string()
    .trim()
    .max(2000, "L'action corrective ne doit pas dépasser 2000 caractères.")
    .optional()
    .nullable(),
});

export type FeedbackTreatmentData = z.infer<typeof FeedbackTreatmentSchema>;

export const UpdateFeedbackSchema = FeedbackTreatmentSchema.partial().extend({
  id: requiredString("L'identifiant de l'avis est requis."),
});
export type UpdateFeedbackPayload = z.infer<typeof UpdateFeedbackSchema>;

export const DeleteFeedbackSchema = z.object({
  id: requiredString("L'identifiant de l'avis est requis."),
});
export type DeleteFeedbackPayload = z.infer<typeof DeleteFeedbackSchema>;

export const TrackFeedbackSchema = z.object({
  code: requiredString("Veuillez saisir votre code de suivi.")
    .min(4, "Le code de suivi doit contenir au moins 4 caractères.")
    .max(50, "Le code de suivi ne peut pas dépasser 50 caractères."),
});
export type TrackFeedbackData = z.infer<typeof TrackFeedbackSchema>;

// ============================================================================
// QUESTIONNAIRE PUBLIC (SOUMISSION D'AVIS)
// ============================================================================

export const SubmitFeedbackBaseSchema = z
  .object({
    actorType: z.enum(ACTOR_TYPE, {
      message: "Veuillez sélectionner votre profil.",
    }),
    isAnonymous: z.boolean(),
    authorName: z.string().trim().optional().nullable(),
    authorEmail: optionalEmail.optional(),
    authorPhone: z.string().trim().optional().nullable(),
    authorRoleOrRoom: z.string().trim().optional().nullable(),
    departmentId: z
      .string()
      .uuid("Veuillez sélectionner un service valide.")
      .optional()
      .nullable(),
    visitDate: z
      .date({ message: "Format de date invalide." })
      .optional()
      .nullable(),
    overallRating: z
      .number({ message: "La note globale est requise." })
      .int()
      .min(1, "La note globale doit être d'au moins 1 étoile.")
      .max(5, "La note ne peut pas dépasser 5 étoiles."),
    recommendation: z.enum(RECOMMENDATION, {
      message: "Veuillez indiquer si vous recommandez cet établissement.",
    }),
    positivePoints: z
      .string()
      .trim()
      .max(2000, "Maximum 2000 caractères.")
      .optional()
      .nullable(),
    negativePoints: z
      .string()
      .trim()
      .max(2000, "Maximum 2000 caractères.")
      .optional()
      .nullable(),
    suggestions: z
      .string()
      .trim()
      .max(2000, "Maximum 2000 caractères.")
      .optional()
      .nullable(),
    answers: z.record(
      z.string(),
      z.union([z.string(), z.number(), z.date()]),
    ),
    website: z.string().max(0, "Tentative automatisée détectée.").optional(), // Honeypot anti-spam
  })
  .superRefine((data, ctx) => {
    if (
      !data.isAnonymous &&
      (!data.authorName || data.authorName.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["authorName"],
        message: "Votre nom est requis pour un avis nominatif.",
      });
    }
  });

export const buildSubmitFeedbackSchema = (fields: SurveyField[]) =>
  SubmitFeedbackBaseSchema.superRefine((data, ctx) => {
    for (const f of fields) {
      if (!f.isActive || !f.targetActors?.includes(data.actorType)) continue;
      const val = data.answers?.[f.id];
      if (f.isRequired && (val === undefined || val === null || val === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["answers", f.id],
          message: `Le champ "${f.label}" est obligatoire.`,
        });
      }
    }
  });

export type SubmitFeedbackPayload = z.infer<typeof SubmitFeedbackBaseSchema>;
