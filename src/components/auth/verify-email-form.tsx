"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { TextInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import {
  VerifyEmailFormSchema,
  VerifyEmailPayload,
} from "@/lib/db/queries/auth/validator";
import { sendVerificationEmail } from "@/lib/db/queries/auth/service";
import { Logo } from "@/components/image";

export const VerifyEmailForm = () => {
  const form = useForm<VerifyEmailPayload>({
    resolver: zodResolver(VerifyEmailFormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: VerifyEmailPayload) => {
    try {
      await sendVerificationEmail({
        email: data.email,
        callbackURL: "/email-verified",
      });
      toast.success("email de confirmation expédié !", {
        description:
          "Vérifiez votre boîte de réception ou vos courriers indésirables.",
      });
      form.reset();
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(
        e?.message || "Impossible d'envoyer l'email de confirmation.",
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
          Vérification d'adresse
        </h1>
        <p className="text-xs text-muted-foreground">
          Saisissez votre email pour recevoir un lien d'activation certifié.
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
          Renvoyer le lien de confirmation
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
