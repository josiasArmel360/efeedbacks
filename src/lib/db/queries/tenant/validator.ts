import { z } from "zod";
import {
  nullablePhoneNumber,
  requiredEmail,
  requiredString,
} from "@/lib/validator-rules";

export const TenantFormSchema = z.object({
  name: requiredString("Le nom de l'établissement est requis.")
    .min(2, "Le nom de l'établissement doit comporter au moins 2 caractères.")
    .max(255, "Le nom de l'établissement ne doit pas dépasser 255 caractères."),
  email: requiredEmail("L'adresse email de l'établissement est requise."),
  phoneNumber: nullablePhoneNumber.optional(),
  city: z
    .string()
    .trim()
    .max(100, "La ville ne doit pas dépasser 100 caractères.")
    .optional()
    .nullable(),
  address: z
    .string()
    .trim()
    .max(255, "L'adresse ne doit pas dépasser 255 caractères.")
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(1000, "La description ne doit pas dépasser 1000 caractères.")
    .optional()
    .nullable(),
  logo: z
    .string()
    .trim()
    .url("L'URL du logo est invalide.")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type TenantFormData = z.infer<typeof TenantFormSchema>;

export const CreateTenantSchema = TenantFormSchema;
export type CreateTenantPayload = TenantFormData;

export const UpdateTenantSchema = TenantFormSchema.partial().extend({
  id: requiredString("L'identifiant de l'établissement est requis."),
});
export type UpdateTenantPayload = z.infer<typeof UpdateTenantSchema>;

export const DeleteTenantSchema = z.object({
  id: requiredString("L'identifiant de l'établissement est requis."),
});
export type DeleteTenantPayload = z.infer<typeof DeleteTenantSchema>;

