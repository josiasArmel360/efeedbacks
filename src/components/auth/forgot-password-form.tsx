"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { TextInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import {
  ForgotPasswordFormSchema,
  ForgotPasswordPayload,
} from "@/lib/db/queries/auth/validator";
import { forgotPassword } from "@/lib/db/queries/auth/service";
import { Logo } from "@/components/image";

export const ForgotPasswordForm = () => {
  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordPayload) => {
    try {
      await forgotPassword(data.email);
      toast.success("Lien de réinitialisation envoyé avec succès", {
        description:
          "Veuillez consulter votre boîte de messagerie, vérifiez aussi vos spams si vous ne le trouvez pas.",
      });
      form.reset();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(
        err?.message ||
          "Une erreur est survenue lors de l'envoi du lien de réinitialisation.",
        { description: "Veuillez réessayer SVP" },
      );
    }
  };

  return (
    <div className="w-full max-w-sm space-y-7 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Logo className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Mot de passe oublié
        </h1>
        <p className="text-xs text-muted-foreground">
          Entrez votre adresse email professionnelle pour recevoir un lien
          sécurisé de réinitialisation.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextInput
          type="email"
          control={form.control}
          name="email"
          label="Adresse email"
          autoComplete="email"
          placeholder="admin@etablissement.org"
          required
        />

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="w-full font-bold shadow-md h-10"
        >
          Envoyer le lien de réinitialisation
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
