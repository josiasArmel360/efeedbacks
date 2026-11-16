"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

import { AccessControlInput } from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";

import { manageAccess } from "@/lib/db/server/access-control";
import {
  type AccessControlData,
  AccessControlSchema,
} from "@/lib/db/queries/access-control/validator";

import type { FormMode, AccessPolicy } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UCFirst } from "@/lib/helper/utility";

interface AccessControlFormProps {
  mode: FormMode;
  policy: AccessPolicy;
  onSuccess?: (mode: FormMode) => void;
  canUpdate: boolean;
}

export const AccessControlForm = ({
  mode: initialMode,
  policy,
  onSuccess,
  canUpdate,
}: AccessControlFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm<AccessControlData>({
    resolver: zodResolver(AccessControlSchema),
    defaultValues: {
      id: policy.id,
      hasFullAccess: policy.hasFullAccess,
      allowedModules: policy.allowedModules,
    },
  });

  const onSubmit = (values: AccessControlData) => {
    startTransition(async () => {
      try {
        const result = await manageAccess(values);

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          onSuccess?.(mode);
          setMode("preview");
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };

  const activeModulesCount = policy.allowedModules.filter(
    (m) => m.hasAccess,
  ).length;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Banderole récapitulative compacte de la politique d'accès */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-linear-to-r from-slate-50/90 via-white to-slate-50/60 px-4 py-2.5 shadow-xs before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Gauche : Icône + Titre + Code rôle + Description */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15">
              <ShieldCheck className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {UCFirst(policy.name)}
                </h4>
                <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-700 border border-amber-500/20 dark:text-amber-300">
                  {UCFirst(policy.code)}
                </span>
              </div>

              {policy.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {policy.description}
                </p>
              )}
            </div>
          </div>

          {/* Droite : Périmètre d'accès & Statut */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
              {policy.hasFullAccess
                ? "Accès Total"
                : `${activeModulesCount} module(s)`}
            </span>

            {policy.isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-500/20 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Actif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-500/20 dark:text-slate-400">
                <XCircle className="size-3" />
                Inactif
              </span>
            )}
          </div>
        </div>
      </div>

      <AccessControlInput
        control={form.control}
        modulesName="allowedModules"
        hasFullAccessName="hasFullAccess"
        disabled={isPreviewMode || isPending}
        description="Cocher cette case donne à tous les utilisateurs ayant ce profil d'avoir un accès complet à tous les modules du système."
      />

      {isPreviewMode ? (
        <ActionsButton
          variant="secondary"
          onClick={() => setMode("update")}
          label="Modifier la règle"
          className="w-full"
          hasAccess={canUpdate}
          size="lg"
        />
      ) : (
        <div className={cn(mode === "update" && "flex gap-3")}>
          {mode === "update" && (
            <CancelButton
              onClick={() => {
                form.reset();
                setMode("preview");
              }}
              disabled={isPending}
            />
          )}
          <SubmitButton
            isLoading={isPending}
            className={cn(mode === "update" ? "flex-1" : "w-full")}
          >
            {mode === "create" ? "Créer la règle" : "Mettre à jour"}
          </SubmitButton>
        </div>
      )}
    </form>
  );
};
