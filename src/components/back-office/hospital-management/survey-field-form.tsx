"use client";

import { useTransition, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { HelpCircle, Hash, Info } from "lucide-react";

import {
  TextInput,
  TextareaInput,
  SwitchInput,
  NumericInput,
  SelectInput,
  SelectWithSearchInput,
  ItemWithDataInput,
} from "@/components/inputs";
import {
  ActionsButton,
  CancelButton,
  SubmitButton,
} from "@/components/buttons";

import { createField, updateField } from "@/lib/db/server/forms-builder";
import {
  SurveyFieldFormSchema,
  type SurveyFieldFormData,
} from "@/lib/db/queries/form-builder/validator";
import type { FormMode, SurveyField, SurveySection } from "@/lib/types";
import { ACTOR_OPTIONS } from "./survey-section-form";

export const FIELD_TYPE_OPTIONS = [
  { value: "rating_5", label: "Évaluation 1 à 5 étoiles" },
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Commentaire libre (Texte long)" },
  { value: "number", label: "Valeur numérique" },
  { value: "radio", label: "Choix unique (Boutons radio)" },
  { value: "select", label: "Liste déroulante" },
  { value: "date", label: "Sélecteur de date" },
];

interface SurveyFieldFormProps {
  mode: FormMode;
  field?: SurveyField | null;
  sections?: SurveySection[];
  defaultSectionId?: string;
  onSuccess?: (mode: FormMode) => void;
  canUpdate?: boolean;
}

export const SurveyFieldForm = ({
  mode: initialMode,
  field,
  sections = [],
  defaultSectionId,
  onSuccess,
  canUpdate = true,
}: SurveyFieldFormProps) => {
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [prevMode, setPrevMode] = useState<FormMode>(initialMode);
  const [isPending, startTransition] = useTransition();

  if (initialMode !== prevMode) {
    setPrevMode(initialMode);
    setMode(initialMode);
  }

  const isPreviewMode = mode === "preview";

  const form = useForm<SurveyFieldFormData>({
    resolver: zodResolver(SurveyFieldFormSchema),
    defaultValues: {
      sectionId: field?.sectionId || defaultSectionId || sections[0]?.id || "",
      label: field?.label || "",
      description: field?.description || "",
      fieldType: field?.fieldType || "rating_5",
      options: field?.options || [],
      targetActors: field?.targetActors || ["malade", "parent_malade"],
      isRequired: field ? field.isRequired : true,
      orderIndex: field?.orderIndex ?? 1,
      isActive: field ? field.isActive : true,
    },
  });

  const selectedFieldType = useWatch({
    control: form.control,
    name: "fieldType",
  });

  const requiresOptions =
    selectedFieldType === "radio" || selectedFieldType === "select";

  const onSubmit = (values: SurveyFieldFormData) => {
    startTransition(async () => {
      try {
        const result =
          mode === "create"
            ? await createField(values)
            : await updateField({ ...values, id: field!.id });

        if (result?.serverError || result?.validationErrors) {
          toast.error(
            result?.serverError ||
              "Une erreur est survenue lors de l'enregistrement du critère.",
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
      {/* 1. Section de rattachement & Type de champ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectWithSearchInput
          control={form.control}
          name="sectionId"
          label="Section thématique rattachée"
          options={sections.map((s) => ({ value: s.id, label: s.title }))}
          disabled={isPreviewMode || isPending}
          required
        />

        <SelectInput
          control={form.control}
          name="fieldType"
          label="Type de réponse attendu"
          options={FIELD_TYPE_OPTIONS}
          disabled={isPreviewMode || isPending}
          required
        />
      </div>

      {/* 2. Intitulé de la question / critère */}
      <TextInput
        control={form.control}
        name="label"
        label="Intitulé de la question ou du critère"
        placeholder="Ex: Qualité, courtoisie et amabilité de l'accueil..."
        icon={HelpCircle}
        disabled={isPreviewMode || isPending}
        required
      />

      {/* 3. Options de réponse (uniquement pour radio ou select) */}
      {requiresOptions && (
        <ItemWithDataInput
          control={form.control}
          name="options"
          label="Choix de réponses possibles"
          placeholder="Ajouter un choix (saisissez puis Entrée)..."
          searchPlaceholder="Saisissez une option puis appuyez sur Entrée..."
          allowCustomInput={true}
          description="Saisissez chaque proposition de réponse et appuyez sur la touche Entrée."
          disabled={isPreviewMode || isPending}
          required
        />
      )}

      {/* 4. Profils d'acteurs ciblés */}
      <ItemWithDataInput
        control={form.control}
        name="targetActors"
        label="Profils d'acteurs ciblés"
        placeholder="Sélectionner un profil cible..."
        searchPlaceholder="Rechercher un profil..."
        options={ACTOR_OPTIONS}
        allowCustomInput={false}
        description="Seuls les profils sélectionnés verront cette question."
        disabled={isPreviewMode || isPending}
        required
      />

      {/* 5. Ordre, Obligatoire et Statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NumericInput
          control={form.control}
          name="orderIndex"
          label="Ordre d'affichage"
          placeholder="1"
          isInteger
          step={1}
          min={0}
          icon={Hash}
          disabled={isPreviewMode || isPending}
        />

        <SwitchInput
          control={form.control}
          name="isRequired"
          label="Caractère obligatoire"
          description={(checked) =>
            checked ? "Réponse obligatoire" : "Réponse facultative"
          }
          disabled={isPreviewMode || isPending}
        />

        <SwitchInput
          control={form.control}
          name="isActive"
          label="Disponibilité"
          description={(checked) =>
            checked ? "Critère actif" : "Critère masqué"
          }
          disabled={isPreviewMode || isPending}
        />
      </div>

      {/* 6. Description / Aide à la saisie */}
      <TextareaInput
        control={form.control}
        name="description"
        label=" Précision ou consigne d'aide (optionnel)"
        placeholder="Ex: Évaluez de 1 (très insatisfait) à 5 (très satisfait)..."
        disabled={isPreviewMode || isPending}
      />

      {/* 7. Note d'information */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>
          {mode === "create"
            ? "Ce critère sera immédiatement intégré dans la section sélectionnée pour les prochains répondants."
            : "L'historique des avis déjà soumis conserve l'intitulé exact au moment de la soumission (snapshot)."}
        </span>
      </div>

      {/* 8. Boutons d'action */}
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
