"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Shield, Tag, Info } from "lucide-react";

import { TextInput, TextareaInput, SwitchInput } from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";

import { createPolicy, updatePolicy } from "@/lib/db/server/access-control";
import {
  type AccessPolicyData,
  AccessPolicySchema,
} from "@/lib/db/queries/access-control/validator";

import type { FormMode, AccessPolicy } from "@/lib/types";

interface AccessPolicyFormProps {
  mode: FormMode;
  accessPolicy?: AccessPolicy | null;
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const AccessPolicyForm = ({
  mode: initialMode,
  accessPolicy,
  onSuccess,
  canUpdate,
}: AccessPolicyFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm({
    resolver: zodResolver(AccessPolicySchema),
    defaultValues: {
      name: accessPolicy?.name || "",
      code: accessPolicy?.code || "",
      description: accessPolicy?.description || "",
      hasFullAccess: accessPolicy ? accessPolicy.hasFullAccess : false,
      isActive: accessPolicy ? accessPolicy.isActive : false,
    },
  });

  const onSubmit = (values: AccessPolicyData) => {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createPolicy(values)
            : await updatePolicy({ ...values, id: accessPolicy!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement du rôle.",
          );
          return;
        }

        if (result?.data?.success) {
          toast.success(result.data.message);
          onSuccess?.(mode);
          if (mode === "create") {
            form.reset();
          } else {
            setMode("preview");
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        toast.error(err.message || "Une erreur interne est survenue.");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* 1. Identification du profil de rôle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          control={form.control}
          name="name"
          label="Intitulé du rôle hospitalier *"
          placeholder="Ex: Auditeur Qualité, Chef de Service, Secrétaire..."
          icon={Shield}
          disabled={isPreviewMode || isPending}
          required
        />

        <div>
          <TextInput
            control={form.control}
            name="code"
            label="Code technique *"
            placeholder="Ex: auditeur_qualite"
            icon={Tag}
            disabled={isPreviewMode || isPending}
            required
          />
        </div>
      </div>

      {/* 2. Privilèges globaux */}
      <SwitchInput
        control={form.control}
        name="hasFullAccess"
        label="Mode d'accès privilégié aux modules"
        description={(checked) =>
          checked
            ? "Accès complet et sans restriction à tous les modules, idéale pour les profils de super administrateur"
            : "Accès modulable selon la matrice des habilitations pour les autres profils"
        }
        disabled={isPreviewMode || isPending}
      />

      {/* 3. Statut */}
      <SwitchInput
        control={form.control}
        name="isActive"
        label="Statut du profil"
        description={(checked) =>
          checked
            ? "Profil actif, accessible et configurable"
            : "Profil inactif, tout compte associé vera ses privilèges revoqués"
        }
        disabled={isPreviewMode || isPending}
      />

      {/* 3. Description des attributions */}
      <TextareaInput
        control={form.control}
        name="description"
        label="Description des fonctions & attributions"
        placeholder="Précisez le périmètre d'action et les responsabilités associées à ce rôle hospitalier..."
        disabled={isPreviewMode || isPending}
      />

      {/* Note d'information */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {mode === "create"
            ? "Dès sa création, ce rôle apparaîtra dans la liste des profils attribuables aux utilisateurs. Vous pourrez configurer sa matrice de droits dans l'onglet dédié."
            : "La modification des paramètres s'appliquera immédiatement aux collaborateurs rattachés à ce profil."}
        </span>
      </div>

      {isPreviewMode ? (
        <ActionsButton
          variant="secondary"
          icon="Pencil"
          onClick={() => setMode("update")}
          label="Modifier les informations"
          className="w-full"
          hasAccess={canUpdate}
          size="lg"
        />
      ) : (
        <div className={"flex gap-4"}>
          <CancelButton
            onClick={() => {
              form.reset();
              if (mode === "update") setMode("preview");
            }}
          />
          <SubmitButton isLoading={isPending} className={"flex-1"}>
            {mode === "create" ? "Enregistrer" : "Mettre à jour"}
          </SubmitButton>
        </div>
      )}
    </form>
  );
};
