"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Layers, Hash, Info } from "lucide-react";

import {
  TextInput,
  TextareaInput,
  SwitchInput,
  NumericInput,
  ItemWithDataInput,
} from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";

import { createSection, updateSection } from "@/lib/db/server/forms-builder";
import {
  SurveySectionFormSchema,
  type SurveySectionFormData,
} from "@/lib/db/queries/form-builder/validator";
import type { FormMode, SurveySection } from "@/lib/types";

export const ACTOR_OPTIONS = [
  { value: "malade", label: "Patient / Malade" },
  { value: "parent_malade", label: "Proche / Accompagnant" },
  { value: "personnel_soignant", label: "Personnel soignant" },
  { value: "personnel", label: "Personnel administratif & technique" },
];

interface SurveySectionFormProps {
  mode: FormMode;
  section?: SurveySection | null;
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const SurveySectionForm = ({
  mode: initialMode,
  section,
  onSuccess,
  canUpdate = true,
}: SurveySectionFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm<SurveySectionFormData>({
    resolver: zodResolver(SurveySectionFormSchema),
    defaultValues: {
      title: section?.title || "",
      orderIndex: section?.orderIndex ?? 1,
      description: section?.description || "",
      targetActors: section?.targetActors || ["malade", "parent_malade"],
      isActive: section ? section.isActive : true,
    },
  });

  const onSubmit = (values: SurveySectionFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createSection(values)
            : await updateSection({ ...values, id: section!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement de la section.",
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
      {/* 1. Titre de la section */}
      <TextInput
        control={form.control}
        name="title"
        label="Titre de la section thématique"
        placeholder="Ex: Accueil, Orientation & Délais d'Attente..."
        icon={Layers}
        disabled={isPreviewMode || isPending}
        required
      />

      {/* 2. Ordre et statut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumericInput
          control={form.control}
          name="orderIndex"
          label="Ordre d'affichage"
          placeholder="1"
          isInteger
          min={0}
          description="Ordre d'apparition dans le parcours du questionnaire."
          icon={Hash}
          disabled={isPreviewMode || isPending}
        />

        <SwitchInput
          control={form.control}
          name="isActive"
          label="Visibilité de la section"
          description={(checked) =>
            checked
              ? "Active (visible dans le questionnaire)"
              : "Masquée / Désactivée"
          }
          disabled={isPreviewMode || isPending}
        />
      </div>

      {/* 3. Publics / Acteurs cibles */}
      <ItemWithDataInput
        control={form.control}
        name="targetActors"
        label="Profils d'acteurs ciblés"
        placeholder="Sélectionner un profil cible..."
        searchPlaceholder="Rechercher un profil..."
        options={ACTOR_OPTIONS}
        allowCustomInput={false}
        description="Détermine à quels répondants cette section sera présentée."
        disabled={isPreviewMode || isPending}
        required
      />

      {/* 4. Description */}
      <TextareaInput
        control={form.control}
        name="description"
        label="Sous-titre / Description explicative"
        placeholder="Ex: Votre première impression et votre prise en charge initiale..."
        disabled={isPreviewMode || isPending}
      />

      {/* 5. Note d'information */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {mode === "create"
            ? "Une fois la section créée, vous pourrez y rattacher vos questions et critères de notation."
            : "La désactivation d'une section masque automatiquement l'ensemble des questions qui lui sont rattachées."}
        </span>
      </div>

      {/* 6. Boutons d'action */}
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
