import { z } from "zod";
import {
  requiredEmail,
  requiredPassword,
  requiredString,
  optionalBoolean,
} from "@/lib/validator-rules";

export const SignInFormSchema = z.object({
  email: requiredEmail("Adresse email requise."),
  password: requiredPassword("Mot de passe requis."),
  rememberMe: optionalBoolean,
});
export type SignInPayload = z.infer<typeof SignInFormSchema>;

export const TwoFactorFormSchema = z.object({
  code: z
    .string()
    .min(6, "Le code doit comporter 6 chiffres")
    .max(6, "Le code doit comporter 6 chiffres"),
});
export type TwoFactorPayload = z.infer<typeof TwoFactorFormSchema>;

export const ForgotPasswordFormSchema = z.object({
  email: requiredEmail("Adresse email requise."),
});
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordFormSchema>;

export const ResetPasswordFormSchema = z
  .object({
    password: requiredPassword("Nouveau mot de passe requis."),
    confirmPassword: requiredPassword("Veuillez confirmer votre mot de passe."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type ResetPasswordPayload = z.infer<typeof ResetPasswordFormSchema>;

export const VerifyEmailFormSchema = z.object({
  email: requiredEmail("Adresse email requise."),
});
export type VerifyEmailPayload = z.infer<typeof VerifyEmailFormSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: requiredString("Le mot de passe actuel est requis."),
    newPassword: requiredPassword("Le nouveau mot de passe est requis."),
    confirmPassword: requiredString(
      "Veuillez confirmer le nouveau mot de passe.",
    ),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });
export type ChangePasswordPayload = z.infer<typeof ChangePasswordSchema>;

export const PasswordPromptSchema = z.object({
  password: requiredString("Le mot de passe est requis."),
});
export type PasswordPromptPayload = z.infer<typeof PasswordPromptSchema>;
