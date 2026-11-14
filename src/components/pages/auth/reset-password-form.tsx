"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

import { PasswordInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import {
  ResetPasswordFormSchema,
  ResetPasswordPayload,
} from "@/lib/db/queries/auth/validator";
import { resetPassword } from "@/lib/db/queries/auth/service";
import { Logo } from "@/components/image";

interface ResetPasswordFormProps {
  token?: string;
  error?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
  successTitle?: string;
  successDescription?: string;
}

export const ResetPasswordForm = ({
  token,
  error,
  title = "Nouveau mot de passe",
  description = "Définissez un mot de passe robuste pour sécuriser l'accès à votre espace d'administration.",
  submitLabel = "Enregistrer le nouveau mot de passe",
  successTitle = "Mot de passe mis à jour",
  successDescription = "Votre accès est désormais sécurisé. Vous pouvez vous connecter.",
}: ResetPasswordFormProps) => {
  const router = useRouter();

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: ResetPasswordPayload) => {
    if (!token) {
      toast.error("Le lien de réinitialisation est manquant ou a expiré.");
      return;
    }

    try {
      await resetPassword({
        newPassword: data.password,
        token,
      });

      toast.success(successTitle, {
        description: successDescription,
      });

      form.reset();
      router.replace("/sign-in");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message || "Impossible de réinitialiser le mot de passe.");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-7 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Logo className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PasswordInput
          control={form.control}
          name="password"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          required
        />

        <PasswordInput
          control={form.control}
          name="confirmPassword"
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          required
        />

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="w-full font-bold shadow-md h-10"
        >
          {submitLabel}
        </SubmitButton>

        <div className="text-center pt-3 border-t border-border/40">
          <Link
            href="/sign-in"
            className="text-xs font-semibold text-primary hover:underline transition-all"
          >
            Retour à la connexion
          </Link>
        </div>
      </form>
    </div>
  );
};
