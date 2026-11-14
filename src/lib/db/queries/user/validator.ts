import {
  nullablePhoneNumber,
  requiredEmail,
  requiredString,
} from "@/lib/validator-rules";
import { z } from "zod";

export const UserFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit comporter au moins 2 caractères.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  email: requiredEmail("L'adresse email est requise."),
  job: z
    .string()
    .trim()
    .max(100, "La fonction ne doit pas dépasser 100 caractères.")
    .optional()
    .nullable(),
  policyId: requiredString("Le role est requis."),
});

export type UserFormData = z.infer<typeof UserFormSchema>;

export const CreateUserSchema = UserFormSchema;
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserFormSchema.extend({
  id: z.string().min(1, "L'identifiant est requis."),
  password: z
    .string()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères.")
    .max(128)
    .optional()
    .nullable(),
});
export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit comporter au moins 2 caractères.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  email: requiredEmail("L'adresse email est requise."),
  phoneNumber: nullablePhoneNumber.optional(),
  job: z
    .string()
    .trim()
    .max(100, "La fonction ne doit pas dépasser 100 caractères.")
    .optional()
    .nullable(),
});
export type UpdateProfilePayload = z.infer<typeof UpdateProfileSchema>;

export const UpdateProfileAvatarSchema = z.object({
  image: z
    .string()
    .trim()
    .url("L'URL de la photo est invalide.")
    .nullable()
    .optional()
    .or(z.literal("")),
});
export type UpdateProfileAvatarPayload = z.infer<
  typeof UpdateProfileAvatarSchema
>;

export const UserBanSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis."),
  banReason: z
    .string()
    .trim()
    .min(3, "Le motif du bannissement ou de la suspension est requis.")
    .max(255, "Le motif ne doit pas dépasser 255 caractères."),
  banExpires: z.date().nullable().optional(),
});
export type UserBanPayload = z.infer<typeof UserBanSchema>;

export const RestoreUserSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis."),
});
export type RestoreUserPayload = z.infer<typeof RestoreUserSchema>;

export const DeleteUserSchema = z.object({
  id: z.string().min(1, "L'identifiant est requis."),
});
export type DeleteUserPayload = z.infer<typeof DeleteUserSchema>;

export const UserIdSchema = DeleteUserSchema;
