import { z } from "zod";
import { requiredString } from "@/lib/validator-rules";
import { CRUD_ACTIONS } from "@/lib/constants";

// ============================================================================
// MODULES & DROITS D'ACCÈS
// ============================================================================

const AllowedModuleSchema = z.object({
  resource: z.string(),
  hasAccess: z.boolean(),
  actions: z
    .array(z.enum(CRUD_ACTIONS, "Veuillez sélectionner une action valide."))
    .min(1, "Veuillez sélectionner au moins une action."),
});

// ============================================================================
// POLITIQUES D'ACCÈS (ACCESS POLICIES)
// ============================================================================

export const AccessPolicySchema = z.object({
  name: requiredString("Le nom de la politique d'accès est requis.").max(
    100,
    "Le nom ne doit pas dépasser 100 caractères.",
  ),
  code: requiredString("Le code technique est requis.")
    .max(50, "Le code ne doit pas dépasser 50 caractères.")
    .regex(
      /^[a-z0-9_]+$/,
      "Le code ne peut comporter que des minuscules, des chiffres et des underscores (ex: auditeur_qualite).",
    ),
  description: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean("Veuillez sélectionner un statut valide"),
  hasFullAccess: z.boolean("Veuillez sélectionner un mode d'accès valide"),
});

export const AccessControlSchema = z.object({
  id: requiredString("Le role à éditer est requis."),
  hasFullAccess: z.boolean("Veuillez sélectionner un mode d'accès valide"),
  allowedModules: z.array(AllowedModuleSchema),
});

export type AccessControlData = z.infer<typeof AccessControlSchema>;

export const CreateAccessPolicySchema = AccessPolicySchema;

export const UpdateAccessPolicySchema = AccessPolicySchema.extend({
  id: requiredString("L'identifiant est requis."),
});

export const DeleteAccessPolicySchema = z.object({
  id: requiredString("L'identifiant est requis."),
});

export type AccessPolicyData = z.infer<typeof AccessPolicySchema>;
export type CreateAccessPolicyPayload = AccessPolicyData;
export type UpdateAccessPolicyPayload = z.infer<
  typeof UpdateAccessPolicySchema
>;
export type DeleteAccessPolicyPayload = z.infer<
  typeof DeleteAccessPolicySchema
>;

// ============================================================================
// DÉROGATIONS UTILISATEURS (USER EXCEPTIONS)
// ============================================================================

export const UserExceptionFormSchema = z.object({
  userId: requiredString("L'identifiant de l'utilisateur est requis."),
  hasFullAccess: z.boolean(),
  allowedModules: z.array(AllowedModuleSchema),
});

export type UserExceptionFormData = z.infer<typeof UserExceptionFormSchema>;

export const SaveUserExceptionSchema = UserExceptionFormSchema;
export type SaveUserExceptionPayload = z.infer<typeof SaveUserExceptionSchema>;

export const DeleteUserExceptionSchema = z.object({
  userId: requiredString("L'identifiant de l'utilisateur est requis."),
});
export type DeleteUserExceptionPayload = z.infer<
  typeof DeleteUserExceptionSchema
>;
