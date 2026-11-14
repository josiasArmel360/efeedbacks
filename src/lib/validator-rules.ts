import * as z from "zod";
import { COUNTRIES } from "./helper/countries";

export const requiredString = (message?: string) =>
  z
    .string()
    .trim()
    .min(1, { message: message || "Ce champ est requis." });

export const nullableString = z.string().trim().nullable();

export const requiredPassword = (message?: string) =>
  z
    .string()
    .trim()
    .min(1, { message: message || "Ce champ est requis" })
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/[A-Z]/, {
      message: "Le mot de passe doit contenir au moins une majuscule",
    })
    .regex(/[a-z]/, {
      message: "Le mot de passe doit contenir au moins une minuscule",
    })
    .regex(/[0-9]/, {
      message: "Le mot de passe doit contenir au moins un chiffre",
    })
    .regex(/[^A-Za-z0-9]/, {
      message: "Le mot de passe doit contenir au moins un caractère spécial",
    });

export const requiredConfirmationPassword = z
  .string()
  .trim()
  .nonempty({ message: "Ce champ es requis." })
  .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" });

export const requiredEmail = (message?: string) =>
  z
    .string()
    .trim()
    .min(1, { message: message || "Ce champ es requis." })
    .email({ message: "Adresse email invalide" })
    .max(100, "L'adresse email ne doit pas dépasser 100 caractères.");

export const optionalEmail = z
  .string()
  .trim()
  .nullable()
  .refine(
    (val) => !val || val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    { message: "Adresse email invalide" },
  );

export const requiredPhoneNumber = z
  .string()
  .trim()
  .min(1, { message: "Le numéro de téléphone est requis." })
  .superRefine((val, ctx) => {
    const country = COUNTRIES.find((c) => val.startsWith(c.dial_code));

    if (!country) {
      const digitsOnly = val.replace(/\D/g, "");
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format de numéro invalide.",
        });
      }
      return;
    }

    const localNumber = val.replace(country.dial_code, "").replace(/\D/g, "");
    if (localNumber.length !== country.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Le numéro doit contenir ${country.length} chiffres.`,
      });
    }
  })
  .transform((val) => val.replace(/[\s\-\(\)\.]/g, ""))
  .refine((val) => /^\+[0-9]+$/.test(val), {
    message:
      "Le format final doit être un indicatif suivi de chiffres (ex: +225...)",
  });

export const nullablePhoneNumber = z
  .string()
  .trim()
  .transform((val) => {
    const digitsOnly = val.replace(/\D/g, "");
    return digitsOnly.length <= 3 ? null : val;
  })
  .nullable()
  .superRefine((val, ctx) => {
    if (!val) return;
    const country = COUNTRIES.find((c) => val.startsWith(c.dial_code));
    if (!country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format de numéro invalide",
      });
      return;
    }

    const localNumber = val.replace(country.dial_code, "").replace(/\D/g, "");
    if (localNumber.length !== country.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Le numéro doit contenir ${country.length} chiffres.`,
      });
    }
  });

export const requiredPositiveDecimal = (message?: string) =>
  z.number().nonnegative(message || "Ce nombre doit être supérieur à 0");

export const nullablePositiveDecimal = (message?: string) =>
  z
    .number()
    .nonnegative(message || "Ce nombre doit être supérieur à 0")
    .nullable();

export const requiredPositiveInteger = (message?: string) =>
  z
    .number()
    .int("Ce nombre doit être un entier valide")
    .positive(message || "Ce nombre doit être supérieur à 0");

export const nullablePositiveInteger = z
  .number()
  .int("Ce nombre doit être un entier valide")
  .positive("Ce nombre doit être supérieur à 0")
  .nullable();

export const requiredInteger = z
  .number()
  .int("Ce nombre doit être un entier valide")
  .nonnegative("Ce nombre doit être supérieur ou égal à 0");

export const nullableInteger = z
  .number()
  .int("Ce nombre doit être un entier valide")
  .nullable();

export const requiredDate = (message?: string) =>
  z.date({ message: message || "Veuillez sélectionner une date valide." });

export const nullableDate = (message?: string) =>
  z
    .date({ message: message || "Veuillez sélectionner une date valide." })
    .nullable();

export const requiredFileUpload = z
  .array(
    z.object({
      key: z.string(),
      url: z.string().url({ message: "URL invalide" }),
      type: z.string(),
      name: z.string(),
      size: z.number(),
    }),
  )
  .min(1, { message: "Ce champ est requis" });

export const optionalFileUpload = z
  .array(
    z.object({
      key: z.string(),
      url: z.string().url({ message: "URL invalide" }),
      type: z.string(),
      name: z.string(),
      size: z.number(),
    }),
  )
  .nullable();

export const requiredBoolean = (message?: string) =>
  z.boolean({ message: message || "Ce champ est requis." });

export const optionalBoolean = z
  .boolean({ message: "Ce champ est requis." })
  .nullable();
