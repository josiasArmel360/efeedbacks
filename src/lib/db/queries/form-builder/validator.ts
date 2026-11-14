import { z } from "zod";
import { requiredString } from "@/lib/validator-rules";
import { ACTOR_TYPE, SURVEY_FIELD_TYPE } from "@/lib/constants";

// ============================================================================
// 1. SCHÉMAS DES SECTIONS THÉMATIQUES (SURVEY SECTION)
// ============================================================================

export const SurveySectionFormSchema = z.object({
  title: requiredString("Le titre de la section est requis.")
    .min(2, "Le titre doit comporter au moins 2 caractères.")
    .max(255, "Le titre ne doit pas dépasser 255 caractères."),
  description: z
    .string()
    .trim()
    .max(500, "La description ne doit pas dépasser 500 caractères.")
    .optional()
    .nullable(),
  targetActors: z
    .array(z.enum(ACTOR_TYPE))
    .min(1, "Veuillez sélectionner au moins un profil d'acteur cible."),
  orderIndex: z
    .number()
    .int("L'ordre d'affichage doit être un entier.")
    .min(0, "L'ordre d'affichage doit être positif ou nul."),
  isActive: z.boolean(),
});

export type SurveySectionFormData = z.infer<typeof SurveySectionFormSchema>;

export const CreateSurveySectionSchema = SurveySectionFormSchema;
export type CreateSurveySectionPayload = SurveySectionFormData;

export const UpdateSurveySectionSchema =
  SurveySectionFormSchema.partial().extend({
    id: requiredString("L'identifiant de la section est requis."),
  });
export type UpdateSurveySectionPayload = z.infer<
  typeof UpdateSurveySectionSchema
>;

export const DeleteSurveySectionSchema = z.object({
  id: requiredString("L'identifiant de la section est requis."),
});
export type DeleteSurveySectionPayload = z.infer<
  typeof DeleteSurveySectionSchema
>;

// ============================================================================
// 2. SCHÉMAS DES CRITÈRES & QUESTIONS (SURVEY FIELD)
// ============================================================================

export const SurveyFieldFormSchema = z.object({
  sectionId: requiredString("La section de rattachement est requise."),
  label: requiredString("L'intitulé de la question est requis.")
    .min(2, "L'intitulé doit comporter au moins 2 caractères.")
    .max(255, "L'intitulé ne doit pas dépasser 255 caractères."),
  description: z
    .string()
    .trim()
    .max(500, "La description ne doit pas dépasser 500 caractères.")
    .optional()
    .nullable(),
  fieldType: z.enum(SURVEY_FIELD_TYPE, {
    message: "Le type de champ est invalide.",
  }),
  options: z.array(z.string().trim().min(1)).optional().nullable(),
  targetActors: z
    .array(z.enum(ACTOR_TYPE))
    .min(1, "Veuillez sélectionner au moins un profil d'acteur cible."),
  isRequired: z.boolean(),
  orderIndex: z
    .number()
    .int("L'ordre d'affichage doit être un entier.")
    .min(0, "L'ordre d'affichage doit être positif ou nul."),
  isActive: z.boolean(),
});

export type SurveyFieldFormData = z.infer<typeof SurveyFieldFormSchema>;

export const CreateSurveyFieldSchema = SurveyFieldFormSchema;
export type CreateSurveyFieldPayload = SurveyFieldFormData;

export const UpdateSurveyFieldSchema = SurveyFieldFormSchema.partial().extend({
  id: requiredString("L'identifiant de la question est requis."),
});
export type UpdateSurveyFieldPayload = z.infer<typeof UpdateSurveyFieldSchema>;

export const DeleteSurveyFieldSchema = z.object({
  id: requiredString("L'identifiant de la question est requis."),
});
export type DeleteSurveyFieldPayload = z.infer<typeof DeleteSurveyFieldSchema>;
