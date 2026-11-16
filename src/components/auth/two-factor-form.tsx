"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { OTPInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import {
  TwoFactorFormSchema,
  TwoFactorPayload,
} from "@/lib/db/queries/auth/validator";
import { verify2FA } from "@/lib/db/queries/auth/service";
import { Logo } from "@/components/image";

interface TwoFactorFormProps {
  callback?: string;
}

export const TwoFactorForm = ({ callback }: TwoFactorFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<TwoFactorPayload>({
    resolver: zodResolver(TwoFactorFormSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = (data: TwoFactorPayload) => {
    startTransition(async () => {
      try {
        await verify2FA(data.code);
        toast.success("Authentification à deux facteurs validée");
        form.reset();
        router.replace(callback || "/dashboard");
      } catch (err: unknown) {
        const e = err as { message?: string };
        toast.error(e?.message || "Code 2FA incorrect ou expiré.");
      }
    });
  };

  return (
    <div className="w-full max-w-sm space-y-7 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Logo className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Double Authentification
        </h1>
        <p className="text-xs text-muted-foreground">
          Saisissez le code temporaire à 6 chiffres fourni par votre application
          d'authentification.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col items-center justify-center space-y-2">
          <OTPInput
            control={form.control}
            name="code"
            label="Code de sécurité (6 chiffres)"
            maxLength={6}
            required
          />
        </div>

        <SubmitButton
          isLoading={isPending || form.formState.isSubmitting}
          className="w-full font-bold shadow-md h-10"
        >
          Valider le code
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
