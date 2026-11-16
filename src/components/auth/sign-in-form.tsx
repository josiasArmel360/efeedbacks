"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { CheckboxInput, PasswordInput, TextInput } from "@/components/inputs";
import { SubmitButton } from "@/components/buttons";
import { Logo } from "@/components/image";
import { signIn } from "@/lib/db/queries/auth/service";
import { APP_NAME } from "@/lib/constants";
import {
  SignInFormSchema,
  SignInPayload,
} from "@/lib/db/queries/auth/validator";

export const SignInForm = ({ callback }: { callback?: string }) => {
  const router = useRouter();

  const form = useForm<SignInPayload>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (payload: SignInPayload) => {
    try {
      const result = await signIn(payload);
      form.reset();
      if ("FA2Redirect" in result) {
        const redirectUrl = callback
          ? `/two-factor?callback=${encodeURIComponent(callback)}`
          : "/two-factor";
        router.push(redirectUrl);
        return;
      }

      toast.success("Authentification réussie");
      router.replace(callback || "/dashboard");
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err?.code === "FORBIDDEN") {
        toast.error(err.message || "Accès refusé", {
          description: `Pour plus d'informations, contactez le support de ${APP_NAME}`,
        });
      } else if (err?.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Adresse email non vérifiée", {
          description:
            "Veuillez vérifier votre adresse email avant de continuer",
        });
        router.push("/verify-email");
      } else if (err?.code === "INVALID_EMAIL_OR_PASSWORD") {
        toast.error("Adresse email ou mot de passe incorrect");
      } else {
        toast.error("Une erreur est survenue lors de l'authentification");
      }
    }
  };

  return (
    <div className="w-full max-w-sm space-y-7 animate-in fade-in duration-500">
      <div className="space-y-2 text-center">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-xs">
          <Logo className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Espace Administratif
        </h1>
        <p className="text-xs text-muted-foreground">
          Connectez-vous pour piloter les avis et la qualité des soins.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextInput
          control={form.control}
          name="email"
          type="email"
          label="Adresse email"
          autoComplete="email"
          placeholder="admin@etablissement.org"
          required
        />

        <PasswordInput
          control={form.control}
          name="password"
          autoComplete="current-password"
          label="Mot de passe"
          required
        />

        <div className="grid grid-cols-2 items-center">
          <CheckboxInput
            control={form.control}
            name="rememberMe"
            label="Se souvenir de moi"
          />
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="font-medium text-primary hover:underline text-sm"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <SubmitButton
          isLoading={form.formState.isSubmitting}
          className="w-full font-bold shadow-md h-10"
        >
          Se connecter
        </SubmitButton>

        <div className="text-center pt-3 border-t border-border/40">
          <Link
            href="/"
            className="text-xs font-semibold text-primary hover:underline transition-all"
          >
            Retour au portail public
          </Link>
        </div>
      </form>
    </div>
  );
};
