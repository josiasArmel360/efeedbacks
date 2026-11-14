import { z } from "zod";
import { requiredString } from "@/lib/validator-rules";

export const DepartmentFormSchema = z.object({
  name: requiredString("Le nom du service est requis.")
    .min(2, "Le nom du service doit comporter au moins 2 caractères.")
    .max(150, "Le nom du service ne doit pas dépasser 150 caractères."),
  description: z
    .string()
    .trim()
    .max(500, "La description ne doit pas dépasser 500 caractères.")
    .optional()
    .nullable(),
  orderIndex: z
    .number()
    .int("L'ordre d'affichage doit être un entier.")
    .min(0, "L'ordre d'affichage doit être un entier positif ou nul."),
  isActive: z.boolean(),
});

export type DepartmentFormData = z.infer<typeof DepartmentFormSchema>;

export const CreateDepartmentSchema = DepartmentFormSchema;
export type CreateDepartmentPayload = DepartmentFormData;

export const UpdateDepartmentSchema = DepartmentFormSchema.partial().extend({
  id: requiredString("L'identifiant du service est requis."),
});
export type UpdateDepartmentPayload = z.infer<typeof UpdateDepartmentSchema>;

export const DeleteDepartmentSchema = z.object({
  id: requiredString("L'identifiant du service est requis."),
});
export type DeleteDepartmentPayload = z.infer<typeof DeleteDepartmentSchema>;
