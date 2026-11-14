"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Ban, AlertTriangle, Mail, Briefcase } from "lucide-react";

import { TextareaInput, DatePickerInput } from "@/components/inputs";
import { CancelButton, SubmitButton } from "@/components/buttons";
import { Badge } from "@/components/badge";

import { ban } from "@/lib/db/server/users";
import {
  UserBanSchema,
  type UserBanPayload,
} from "@/lib/db/queries/user/validator";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/helper/utility";

interface UserBanFormProps {
  user: User;
  onSuccess?: () => void;
}

export const UserBanForm = ({ user, onSuccess }: UserBanFormProps) => {
  const [isPending, startTransition] = useTransition();

  const initials = getInitials(user.name);

  const form = useForm<UserBanPayload>({
    resolver: zodResolver(UserBanSchema),
    defaultValues: {
      id: user.id,
      banReason: user.banReason || "",
      banExpires: user.banExpires ? new Date(user.banExpires) : null,
    },
  });

  const onSubmit = (values: UserBanPayload) => {
    startTransition(async () => {
      try {
        const result = await ban(values);

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de la suspension de l'utilisateur.",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          onSuccess?.();
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* 1. Récapitulatif de l'utilisateur concerné */}
      <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4 flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold text-sm shrink-0 border border-destructive/20">
          {initials || "U"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-sm">
              {user.name}
            </span>
            <Badge
              variant="outline"
              className="text-[11px] font-medium py-0 border-destructive/30 text-destructive bg-destructive/10"
            >
              {user.policy?.name || "Utilisateur"}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <Mail className="size-3 text-muted-foreground/70" />
              {user.email}
            </span>
            {user.job && (
              <span className="flex items-center gap-1">
                <Briefcase className="size-3 text-muted-foreground/70" />
                {user.job}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Motif et paramètres de la suspension */}
      <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2 text-sm font-semibold text-foreground">
          <Ban className="h-4 w-4 text-destructive" />
          <span>Paramètres de la suspension administrative</span>
        </div>

        <TextareaInput
          control={form.control}
          name="banReason"
          label="Motif obligatoire de la suspension *"
          placeholder="Ex: Mesure conservatoire, fin d'affectation, manquement déontologique..."
          required
        />

        <DatePickerInput
          control={form.control}
          name="banExpires"
          label="Date d'expiration de la suspension"
          placeholder="Sélectionner une date de fin (facultatif)"
          description="Laissez ce champ vide pour appliquer une suspension à durée indéterminée."
          disablePrevDate={true}
        />
      </div>

      {/* 3. Avertissement de sécurité */}
      <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <span className="leading-relaxed">
          <strong>Révocation immédiate :</strong> La validation de cette action
          révoquera instantanément toutes les sessions actives de ce
          collaborateur sur tous ses terminaux. Toute nouvelle tentative de
          connexion sera bloquée jusqu'à la date d'expiration ou la réactivation
          manuelle de son compte.
        </span>
      </div>

      <div className="flex gap-4">
        <CancelButton onClick={() => form.reset()} />

        <SubmitButton isLoading={isPending} className="flex-1">
          Confirmer la suspension
        </SubmitButton>
      </div>
    </form>
  );
};
