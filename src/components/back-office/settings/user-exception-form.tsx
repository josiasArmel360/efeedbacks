"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RotateCcw, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";

import { AccessControlInput } from "@/components/inputs";
import { ActionsButton, SubmitButton } from "@/components/buttons";

import { saveException, removeException } from "@/lib/db/server/access-control";
import {
  type UserExceptionFormData,
  UserExceptionFormSchema,
} from "@/lib/db/queries/access-control/validator";

import type { User, AccessPolicy, FormMode } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface UserExceptionFormProps {
  user: User;
  policy?: AccessPolicy | null;
  onSuccess?: () => void;
  canUpdate: boolean;
}

export const UserExceptionForm = ({
  user,
  policy,
  onSuccess,
  canUpdate,
}: UserExceptionFormProps) => {
  const [mode, setMode] = useState<FormMode>(
    user.permissionException ? "update" : "create",
  );
  const [isPending, startTransition] = useTransition();

  const isPreviewMode = mode === "preview";
  const hasCustomException = !!user.permissionException;

  const defaultModules =
    user.permissionException?.allowedModules || policy?.allowedModules || [];
  const defaultFullAccess =
    user.permissionException?.hasFullAccess ?? (policy?.hasFullAccess || false);

  const form = useForm<UserExceptionFormData>({
    resolver: zodResolver(UserExceptionFormSchema),
    defaultValues: {
      userId: user.id,
      hasFullAccess: defaultFullAccess,
      allowedModules: defaultModules,
    },
  });

  const onSubmit = (values: UserExceptionFormData) => {
    startTransition(async () => {
      try {
        const result = await saveException(values);

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement de la dérogation",
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

  const onResetToDefault = () => {
    if (!hasCustomException) return;
    startTransition(async () => {
      try {
        const result = await removeException({ userId: user.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError || "Échec de la réinitialisation des droits",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          form.reset({
            userId: user.id,
            hasFullAccess: policy?.hasFullAccess || false,
            allowedModules: policy?.allowedModules || [],
          });
          onSuccess?.();
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Banderole récapitulative du collaborateur & statut de dérogation */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/60 p-3 shadow-xs dark:border-slate-800 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/15">
              <UserCheck className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </h4>
                <span className="text-xs text-muted-foreground truncate">
                  ({user.email})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Politique par défaut :{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {policy?.name || user.policy?.name || "Non assignée"}
                </span>{" "}
                ({policy?.code || user.policy?.code || "-"})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasCustomException ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-500/20 dark:text-amber-300">
                <ShieldAlert className="size-3" />
                Dérogation active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-500/20 dark:text-emerald-400">
                <ShieldCheck className="size-3" />
                Droits standards
              </span>
            )}

            {hasCustomException && canUpdate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={onResetToDefault}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2"
              >
                <RotateCcw className="size-3 mr-1" />
                Rétablir défaut
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Matrice des droits */}
      <AccessControlInput
        control={form.control}
        modulesName="allowedModules"
        hasFullAccessName="hasFullAccess"
        disabled={isPreviewMode || isPending}
        description="Personnalisez les autorisations de ce collaborateur. Les choix définis ici prévalent sur sa politique d'accès globale."
      />

      {/* Actions */}
      {isPreviewMode ? (
        <ActionsButton
          variant="secondary"
          onClick={() => setMode("update")}
          label="Modifier les dérogations"
          className="w-full"
          hasAccess={canUpdate}
          size="lg"
        />
      ) : (
        <div className="flex items-center gap-3">
          <SubmitButton isLoading={isPending} className="flex-1">
            Enregistrer les dérogations
          </SubmitButton>
        </div>
      )}
    </form>
  );
};
