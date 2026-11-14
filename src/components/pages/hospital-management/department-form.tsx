"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Hash, Info } from "lucide-react";

import {
  TextInput,
  TextareaInput,
  SwitchInput,
  NumericInput,
} from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";

import { create, update } from "@/lib/db/server/departments";
import {
  DepartmentFormSchema,
  DepartmentFormData,
} from "@/lib/db/queries/department/validator";
import type { FormMode, Department } from "@/lib/types";

interface DepartmentFormProps {
  mode: FormMode;
  department?: Department | null;
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const DepartmentForm = ({
  mode: initialMode,
  department,
  onSuccess,
  canUpdate = true,
}: DepartmentFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(DepartmentFormSchema),
    defaultValues: {
      name: department?.name || "",
      orderIndex: department?.orderIndex ?? 0,
      description: department?.description || "",
      isActive: department ? department.isActive : true,
    },
  });

  const onSubmit = (values: DepartmentFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await create(values)
            : await update({ ...values, id: department!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement du service.",
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
      {/* 1. Intitulé principal du service */}
      <TextInput
        control={form.control}
        name="name"
        label="Intitulé du service hospitalier"
        placeholder="Ex: Urgences Médicales, Maternité, Pédiatrie..."
        icon={Building2}
        disabled={isPreviewMode || isPending}
        required
      />

      {/* 2. Configuration d'affichage et statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumericInput
          control={form.control}
          name="orderIndex"
          label="Position dans le formulaire"
          placeholder="0"
          isInteger
          min={0}
          step={1}
          icon={Hash}
          disabled={isPreviewMode || isPending}
        />

        <SwitchInput
          control={form.control}
          name="isActive"
          label="Disponibilité du service"
          description={(checked) =>
            checked
              ? "Actif (ouvert aux avis usagers)"
              : "En sommeil / Désactivé"
          }
          disabled={isPreviewMode || isPending}
        />
      </div>

      {/* 3. Description & Localisation */}
      <TextareaInput
        control={form.control}
        name="description"
        label="Description / Localisation au sein de l'établissement"
        placeholder="Ex: Bâtiment B, RDC - Accueil des urgences et consultations non programmées..."
        disabled={isPreviewMode || isPending}
      />

      {/* 4. Note d'information contextuelle */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {mode === "create"
            ? "Dès sa création, ce service apparaîtra dans la liste de sélection des questionnaires publics et disposera d'un QR code dédié."
            : "La modification des paramètres s'appliquera immédiatement aux futures évaluations et aux tableaux de bord statistiques."}
        </span>
      </div>

      {/* 5. Actions / Boutons de validation */}
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
        <div className="flex gap-4">
          <CancelButton
            onClick={() => {
              form.reset();
              if (mode === "update") setMode("preview");
            }}
          />
          <SubmitButton isLoading={isPending} className="flex-1">
            {mode === "create" ? "Enregistrer" : "Mettre à jour"}
          </SubmitButton>
        </div>
      )}
    </form>
  );
};
