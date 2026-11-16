"use client";

import React, { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckboxInput, PasswordInput } from "@/components/inputs";
import { CancelButton, SubmitButton } from "@/components/buttons";

import { useAuth } from "@/hooks/use-auth";
import {
  ChangePasswordSchema,
  type ChangePasswordPayload,
} from "@/lib/db/queries/auth/validator";
import { cn } from "@/lib/utils";

const PASSWORD_REQUIREMENTS = [
  {
    id: "length",
    label: "Au moins 8 caractères",
    test: (val: string) => val.length >= 8,
  },
  {
    id: "upper",
    label: "Au moins une lettre majuscule (A-Z)",
    test: (val: string) => /[A-Z]/.test(val),
  },
  {
    id: "lower",
    label: "Au moins une lettre minuscule (a-z)",
    test: (val: string) => /[a-z]/.test(val),
  },
  {
    id: "digit",
    label: "Au moins un chiffre (0-9)",
    test: (val: string) => /[0-9]/.test(val),
  },
  {
    id: "special",
    label: "Au moins un caractère spécial (!@#$%^&*)",
    test: (val: string) => /[^A-Za-z0-9]/.test(val),
  },
];

export const ChangePasswordForm = () => {
  const { updatePassword } = useAuth();
  const form = useForm<ChangePasswordPayload>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
  });

  const watchedNewPassword = useWatch({
    control: form.control,
    name: "newPassword",
    defaultValue: "",
  });

  const satisfiedCount = useMemo(() => {
    return PASSWORD_REQUIREMENTS.filter((req) =>
      req.test(watchedNewPassword || ""),
    ).length;
  }, [watchedNewPassword]);

  const onSubmit = async (values: ChangePasswordPayload) => {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      });

      toast.success("Votre mot de passe a été mis à jour avec succès.");
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        revokeOtherSessions: true,
      });
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de modifier le mot de passe.",
      );
    }
  };

  return (
    <Card className="border-border/60 shadow-xs py-0 gap-0 overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Modification du mot de passe
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choisissez un mot de passe robuste pour protéger l&apos;accès à
              votre espace de gouvernance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulaire */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="lg:col-span-6 space-y-4"
          >
            <PasswordInput
              control={form.control}
              name="currentPassword"
              label="Mot de passe actuel"
              placeholder="Entrez votre mot de passe actuel"
              icon={Lock}
              required
            />

            <PasswordInput
              control={form.control}
              name="newPassword"
              label="Nouveau mot de passe"
              placeholder="Entrez votre nouveau mot de passe"
              icon={KeyRound}
              required
            />

            <PasswordInput
              control={form.control}
              name="confirmPassword"
              label="Confirmer le nouveau mot de passe"
              placeholder="Répétez le nouveau mot de passe"
              icon={KeyRound}
              required
            />

            <div className="pt-1">
              <CheckboxInput
                control={form.control}
                name="revokeOtherSessions"
                label="Me déconnecter automatiquement de tous les autres appareils actifs"
                description="Recommandé si vous pensez qu'un tiers a pu avoir accès à votre compte."
              />
            </div>

            <div className="flex items-center gap-3">
              <CancelButton
                label="Réinitialiser"
                onClick={() => form.reset()}
                disabled={form.formState.isSubmitting}
              />
              <SubmitButton
                isLoading={form.formState.isSubmitting}
                className="flex-1"
              >
                Mettre à jour le mot de passe
              </SubmitButton>
            </div>
          </form>

          {/* Checklist dynamique des critères de sécurité */}
          <div className="lg:col-span-6 rounded-xl border border-border/60 bg-muted/20 p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Exigences de sécurité
                </h3>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {satisfiedCount}/{PASSWORD_REQUIREMENTS.length}
              </span>
            </div>

            {/* Jauge de robustesse */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  satisfiedCount <= 2 && "bg-rose-500",
                  satisfiedCount >= 3 && satisfiedCount < 5 && "bg-amber-500",
                  satisfiedCount === 5 && "bg-emerald-500",
                )}
                style={{
                  width: `${(satisfiedCount / PASSWORD_REQUIREMENTS.length) * 100}%`,
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Votre nouveau mot de passe doit respecter l&apos;ensemble des
              critères suivants :
            </p>

            <ul className="space-y-2.5">
              {PASSWORD_REQUIREMENTS.map((req) => {
                const isMet = req.test(watchedNewPassword || "");
                return (
                  <li
                    key={req.id}
                    className={cn(
                      "flex items-center gap-2.5 text-xs transition-colors",
                      isMet
                        ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {isMet ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
